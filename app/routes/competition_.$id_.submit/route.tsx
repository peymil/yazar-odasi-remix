import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router';
import { Form, Link, useActionData, useLoaderData } from 'react-router';
import { Plus, Minus } from 'lucide-react';
import React from 'react';
import { prisma } from '~/.server/prisma';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { validateSessionToken } from '~/.server/auth';
import { authTokenCookie } from '~/.server/cookies';
import { Route } from './+types/route';

export async function loader({ request, params }: Route.ActionArgs) {
  console.log('competition.id.submit');

  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  const session = await validateSessionToken(sessionToken);
  if (!session.user) {
    return redirect('/auth/sign-in');
  }

  const competition = await prisma.competition.findUnique({
    where: { id: parseInt(params.id!) },
    include: {
      company: {
        include: {
          company_profile: true,
        },
      },
    },
  });

  if (!competition) {
    throw new Response('Not Found', { status: 404 });
  }

  const isCompanyUser = session.user.company_user.some(
    (cu) => cu.company_id === competition.company_id
  );

  if (isCompanyUser) {
    return redirect(`/competitions/${competition.id}`);
  }

  return { competition };
}

export async function action({ request, params }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  const session = await validateSessionToken(sessionToken);
  if (!session.user) {
    return redirect('/auth/sign-in');
  }

  const formData = await request.formData();
  const links = formData.getAll('links[]').filter(Boolean) as string[];

  if (links.length === 0) {
    return { error: 'At least one link is required' };
  }

  const competition = await prisma.competition.findUnique({
    where: { id: parseInt(params.id!) },
  });

  if (!competition || new Date(competition.end_date) < new Date()) {
    return redirect(`/competition/${params.id}`);
  }

  await prisma.competition_delivery.create({
    data: {
      competition_id: competition.id,
      user_id: session.user.id,
      links,
    },
  });

  return redirect(`/competition/${params.id}`);
}

export default function CompetitionSubmitRoute() {
  const { competition } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const companyProfile = competition.company.company_profile[0];
  const [links, setLinks] = React.useState<Array<{ id: number }>>([
    { id: Date.now() },
  ]);

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
          for {competition.title} by{' '}
          {companyProfile?.name || competition.company.name}
        </div>

        <Form method="post" className="space-y-6">
          <div className="space-y-4" id="links">
            {links.map((link, i) => (
              <div
                key={link.id}
                className="relative mb-4 p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Link #{i + 1}</Label>
                  {links.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setLinks(links.filter((l) => l.id !== link.id));
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  name="links[]"
                  type="url"
                  placeholder="https://"
                  className="w-full"
                  required
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setLinks([...links, { id: Date.now() }]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Link
            </Button>
          </div>

          {actionData?.error && (
            <p className="text-red-500 text-sm">{actionData.error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-yo-orange hover:bg-yo-orange/90"
          >
            Submit Entry
          </Button>
        </Form>
      </div>
    </div>
  );
}
