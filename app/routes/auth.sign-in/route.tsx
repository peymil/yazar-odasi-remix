import {prisma} from "~/.server/prisma";

import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {authSignInSchema} from "~/.server/schemas/auth-sign-in.schema";
import {createSession, generateSessionToken, verifyPassowrd} from "~/.server/auth";
import {authTokenCookie} from "~/.server/cookies";
import {SignIn} from "~/components/sign-in";

export async function action({request}: ActionFunctionArgs) {
    const body = Object.fromEntries(await request.formData());
    const payload = authSignInSchema.parse(body);
    const user = await prisma.user.findFirstOrThrow({
        where: {email: payload.email},
    });
    if (!(await verifyPassowrd(payload.password, user.password))) {
        throw new Error("User password is incorrect");
    }
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    return redirect("/", {
        headers: {
            "Set-Cookie": await authTokenCookie.serialize(sessionToken, {
                expires: session.expiresAt,
            }),
        },
    });
}

export default function Layout() {
    return (
        <div>
            <h1>Sign In</h1>
            <SignIn/>
        </div>
    );
}
