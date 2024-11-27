import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/.server/prisma";

import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { hashPassword } from "~/.server/auth";
import { Form } from "@remix-run/react";
import { authSignUpSchema } from "~/.server/schemas/auth-sign-up-password.schema";
import { authTokenCookie } from "~/.server/cookies";

export async function action({ request }: ActionFunctionArgs) {
  const body = Object.fromEntries(await request.formData());
  const { name, password, email } = authSignUpSchema.parse(body);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashPassword(password),
    },
  });

  await prisma.user_profile.create({
    data: {
      user_id: user.id,
      about: "About me.",
    },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    },
  });
  return redirect("/", {
    headers: {
      "Set-Cookie": await authTokenCookie.serialize(session.id, {
        expires: session.expiresAt,
      }),
    },
  });
}

export default function Layout() {
  return (
    <div>
      <h1>Sign Up</h1>
      <Form method="post">
        <Label>
          Email
          <Input type="email" name="email" />
        </Label>
        <Label>
          Name
          <Input type="text" name="name" />
        </Label>
        <Label>
          Password
          <Input type="password" name="password" />
        </Label>
        <Button type="submit">Sign Up</Button>
      </Form>
    </div>
  );
}
