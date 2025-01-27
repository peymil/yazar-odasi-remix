import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { prisma } from "~/.server/prisma";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { validateSessionToken } from "~/.server/auth";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await validateSessionToken(
    await request.headers.get("Cookie")?.split("auth-token=")[1] || ""
  );

  if (!session.user) {
    return redirect("/auth/sign-in");
  }

  const competition = await prisma.competition.findUnique({
    where: { id: parseInt(params.id!) },
    include: {
      company: {
        include: {
          company_profile: true
        }
      }
    }
  });

  if (!competition) {
    throw new Response("Not Found", { status: 404 });
  }

  if (new Date(competition.end_date) < new Date()) {
    return redirect(`/competition/${competition.id}`);
  }

  const isCompanyUser = session.user.company_user.some(
    cu => cu.company_id === competition.company_id
  );

  if (isCompanyUser) {
    return redirect(`/competitions/${competition.id}`);
  }

  return json({ competition });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await validateSessionToken(
    await request.headers.get("Cookie")?.split("auth-token=")[1] || ""
  );

  if (!session.user) {
    return redirect("/auth/sign-in");
  }

  const formData = await request.formData();
  const links = formData.getAll("links[]").filter(Boolean) as string[];

  if (links.length === 0) {
    return json({ error: "At least one link is required" });
  }

  const competition = await prisma.competition.findUnique({
    where: { id: parseInt(params.id!) }
  });

  if (!competition || new Date(competition.end_date) < new Date()) {
    return redirect(`/competition/${params.id}`);
  }

  await prisma.competition_delivery.create({
    data: {
      competition_id: competition.id,
      user_id: session.user.id,
      links
    }
  });

  return redirect(`/competition/${params.id}`);
}

export default function CompetitionSubmitRoute() {
  const { competition } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const companyProfile = competition.company.company_profile[0];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link 
          to={`/competition/${competition.id}`}
          className="text-yo-orange hover:underline"
        >
          ← Back to Competition
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Submit Entry</h1>
        <div className="text-yo-text-secondary mb-6">
          for {competition.title} by {companyProfile?.name || competition.company.name}
        </div>

        <Form method="post" className="space-y-6">
          <div className="space-y-4" id="links">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <Label htmlFor={`link-${index}`}>Link {index + 1}</Label>
                <Input
                  id={`link-${index}`}
                  name="links[]"
                  type="url"
                  placeholder="https://"
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {actionData?.error && (
            <p className="text-red-500 text-sm">{actionData.error}</p>
          )}

          <Button type="submit" className="w-full bg-yo-orange hover:bg-yo-orange/90">
            Submit Entry
          </Button>
        </Form>
      </div>
    </div>
  );
}
