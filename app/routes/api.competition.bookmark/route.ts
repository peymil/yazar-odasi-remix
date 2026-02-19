import { redirect } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { prisma } from '~/.server/prisma';
import { getSessionFromRequest } from '~/.server/auth';

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return redirect('/auth/sign-in');
  }

  const userId = session.user.id;
  const formData = await request.formData();
  const competitionId = parseInt(formData.get('competitionId') as string);
  const actionType = formData.get('action') as 'add' | 'remove';

  if (isNaN(competitionId)) {
    return new Response('Invalid competitionId', { status: 400 });
  }

  if (actionType === 'add') {
    await prisma.competition_bookmark.upsert({
      where: {
        user_id_competition_id: {
          user_id: userId,
          competition_id: competitionId,
        },
      },
      create: { user_id: userId, competition_id: competitionId },
      update: {},
    });
  } else {
    await prisma.competition_bookmark.deleteMany({
      where: { user_id: userId, competition_id: competitionId },
    });
  }

  return { success: true };
}
