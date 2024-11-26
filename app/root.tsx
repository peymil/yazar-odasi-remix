import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";
import type {LinksFunction, LoaderFunctionArgs} from "@remix-run/node";

import "./tailwind.css";
import {prisma} from "~/.server/prisma";
import {authTokenCookie} from "~/.server/cookies";
import Navbar from "~/components/Navbar";

export const links: LinksFunction = () => [
    {rel: "preconnect", href: "https://fonts.googleapis.com"},
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export async function loader({request}: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const sessionToken =
        (await authTokenCookie.parse(cookieHeader));
    if (sessionToken) {
        const session = await prisma.session.findUnique({
            where: {id: sessionToken},
            include: {user: true},
        });

        return {
            user: session?.user,
        };
    } else {
        return {
            user: null,
        }
    }
}

export function Layout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <Links/>
        </head>
        <body>
        <Navbar/>
        {children}
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

export default function App() {
    return <Outlet/>;
}
