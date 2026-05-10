import { ActionFunctionArgs } from 'react-router';
import { prisma } from '~/.server/prisma';
import { getSessionFromRequest } from '~/.server/auth';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const currentUser = await getSessionFromRequest(request);
  if (!currentUser?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json() as { orderedIds: number[] };
  const { orderedIds } = body;

  if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== 'number')) {
    return new Response('Invalid payload', { status: 400 });
  }

  // Verify all projects belong to the current user's profile
  const profile = await prisma.user_profile.findFirst({
    where: { user_id: currentUser.user.id },
  });

  if (!profile) {
    return new Response('Profile not found', { status: 404 });
  }

  const projects = await prisma.user_profile_project.findMany({
    where: { id: { in: orderedIds }, profile_id: profile.id },
    select: { id: true },
  });

  if (projects.length !== orderedIds.length) {
    return new Response('Forbidden', { status: 403 });
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.user_profile_project.update({
        where: { id },
        data: { index },
      })
    )
  );

  return new Response(null, { status: 204 });
}
