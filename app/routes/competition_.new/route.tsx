import { redirect, type ActionFunctionArgs } from 'react-router';
import { Form, useActionData } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { validateSessionToken } from '~/.server/auth';
import { prisma } from '~/.server/prisma';
import { authTokenCookie } from '~/.server/cookies';
import { Route } from './+types/route';

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);
  const session = await validateSessionToken(sessionToken);

  if (!session.user || session.user.company_user.length === 0) {
    return redirect('/');
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;

  if (!title || !description || !startDate || !endDate) {
    return { error: 'All fields are required' };
  }

  const company = session.user.company_user[0].company;

  const { id } = await prisma.competition.create({
    data: {
      title,
      description,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      company_id: company.id,
    },
  });

  return redirect(`/competition/${id}`);
}

export default function NewCompetitionRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Create Competition
      </h1>

      <Form method="post" className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter competition title"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter competition description"
            className="w-full min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" name="endDate" type="date" className="w-full" />
          </div>
        </div>

        {actionData?.error && (
          <p className="text-red-500 text-sm">{actionData.error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-yo-orange hover:bg-yo-orange/90"
        >
          Create Competition
        </Button>
      </Form>
    </div>
  );
}
