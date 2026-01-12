import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router';
import type { LinksFunction, LoaderFunctionArgs } from 'react-router';

import './tailwind.css';
import { authTokenCookie } from '~/.server/cookies';
import { validateSessionToken } from '~/.server/auth';
import { Route } from './+types/root';
import { Header } from './components/Header';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

export async function shouldRevalidate() {
  return false;
}

export async function loader({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);
  if (sessionToken) {
    const session = await validateSessionToken(sessionToken);
    return {
      user: session?.user,
    };
  } else {
    return {
      user: null,
    };
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white">
        <Header user={data?.user} />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
