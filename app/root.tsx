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
import {
  Box,
  Key,
  LogIn,
  LogOut,
  MessageCircleQuestion,
  Percent,
  Plus,
  PenSquare,
  User,
  UserRoundPlus,
  Wallet,
} from 'lucide-react';
import { validateSessionToken } from '~/.server/auth';
import { Route } from './+types/root';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
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
      <body>
        <nav className=" h-36 sticky flex items-center justify-evenly text-[#9197B3]">
          <Link to="/" className={'relative w-32 h-32'}>
            <img
              src={'https://cdn.yazarodasi.com/yazar_odasi_logo.svg'}
              alt={'yazar odasi logo'}
              sizes={'10vv'}
            />
          </Link>
          <Link to="/" className={'flex gap-2'}>
            <Key size={24} />
            <p>Anasayfa</p>
          </Link>
          <Link to="/services" className={'flex gap-2'}>
            <Box />
            <p>Öne Çıkanlar</p>
          </Link>
          <Link to="/user/project" className={'flex gap-2'}>
            <Percent />
            <p>Proje Keşfet</p>
          </Link>
          <Link to="/user/profile" className={'flex gap-2'}>
            <Wallet />
            <p>Yazar Keşfet</p>
          </Link>
          <Link to="/competition" className={'flex gap-2'}>
            <MessageCircleQuestion />
            <p>Açık Çağrılar</p>
          </Link>
          <form className="">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg "
                placeholder="Yazar, Proje ya da Çağrı "
                required
              />
            </div>
          </form>

          {data?.user ? (
            <>
              <Link
                to={`/user/${data.user.id}/profile`}
                className={'flex gap-2'}
              >
                <User />
                <p>Profil</p>
              </Link>
              {data.user.company_user.length === 0 && (
                <Link to="/company" className={'flex gap-2'}>
                  <Plus />
                  <p>Şirket Oluştur</p>
                </Link>
              )}
              {data.user.company_user.length > 0 && (
                <Link to="/competition/new" className={'flex gap-2'}>
                  <Plus />
                  <p>Yarışma Oluştur</p>
                </Link>
              )}
              <Link to="/auth/sign-out" className={'flex gap-2'}>
                <LogOut />
                <p>Çıkış Yap</p>
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth/sign-in" className={'flex gap-2'}>
                <LogIn />
                <p>Giriş Yap</p>
              </Link>
              <Link to="/auth/sign-up" className={'flex gap-2'}>
                <UserRoundPlus />
                <p> Üye ol</p>
              </Link>
            </>
          )}
        </nav>
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
