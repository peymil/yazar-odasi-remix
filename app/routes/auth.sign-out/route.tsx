import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {authTokenCookie} from "~/.server/cookies";
import {useSubmit} from "@remix-run/react";
import {useEffect} from "react";
import {invalidateSession} from "~/.server/auth";

export async function action({request}: ActionFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const sessionToken = await authTokenCookie.parse(cookieHeader);

    await invalidateSession(sessionToken);

    return redirect("/", {
        headers: {
            "Set-Cookie": await authTokenCookie.serialize(sessionToken, {
                expires: new Date(0),
            }),
        },
    });
}

export default function Layout() {
    const submit = useSubmit();
    const formData = new FormData();
    useEffect(() => {
        submit(formData, {method: "post"});
    }, []);
}
