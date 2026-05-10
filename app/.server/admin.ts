import { prisma } from '~/.server/prisma';
import { getSessionFromRequest } from '~/.server/auth';
import { redirect } from 'react-router';

export async function requireAdmin(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    throw redirect('/auth/sign-in');
  }

  const adminRecord = await prisma.admin.findUnique({
    where: { user_id: session.user.id },
  });

  if (!adminRecord) {
    throw new Response('Forbidden', { status: 403 });
  }

  return session.user;
}
