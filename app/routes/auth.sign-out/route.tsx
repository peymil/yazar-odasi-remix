import { ActionFunctionArgs, redirect } from 'react-router';
import { authTokenCookie } from '~/.server/cookies';
import { useSubmit } from 'react-router';
import { useEffect } from 'react';
import { invalidateSession } from '~/.server/auth';
import { Route } from './+types/route';

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  await invalidateSession(sessionToken);

  return redirect('/', {
    headers: {
      'Set-Cookie': await authTokenCookie.serialize(sessionToken, {
        expires: new Date(0),
      }),
    },
  });
}

export default function Layout() {
  const submit = useSubmit();
  const formData = new FormData();
  useEffect(() => {
    submit(formData, { method: 'post' });
  }, []);
}
