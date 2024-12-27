import {prisma} from "~/.server/prisma";

import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {authSignUpSchema} from "~/.server/schemas/auth-sign-up-password.schema";
import {authTokenCookie} from "~/.server/cookies";
import {
    createSession,
    generateSessionToken,
    hashPassword,
} from "~/.server/auth";
import {SignUp} from "~/components/sign-up";

export async function action({request}: ActionFunctionArgs) {
    const body = Object.fromEntries(await request.formData());
    const {name, password, email} = authSignUpSchema.parse(body);

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: await hashPassword(password),
        },
    });

    await prisma.user_profile.create({
        data: {
            user_id: user.id,
            about: "About me.",
        },
    });
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
        <div className={"container mx-auto flex items-center justify-center gap-4"}>
            <SignUp/>
        </div>
    );
}
