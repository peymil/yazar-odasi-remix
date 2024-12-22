import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/.server/prisma";

import { ActionFunctionArgs } from "@remix-run/node";
import { authSignInSchema } from "~/.server/schemas/auth-sign-in.schema";
import { Form } from "@remix-run/react";
import { verifyPassowrd } from "~/.server/auth";

export async function action({ request }: ActionFunctionArgs) {
  const payload = authSignInSchema.parse(request.body);
  const user = await prisma.user.findFirstOrThrow({
    where: { email: payload.email },
  });
  if (!(await verifyPassowrd(payload.password, user.password))) {
    throw new Error("User password is incorrect");
  }
}

export default function Layout() {
  return (
    <div>
      <h1>Sign In</h1>
      <Form method={"POST"}>
        <Label>
          Email
          <Input type="email" name="email" />
        </Label>
        <Label>
          Password
          <Input type="password" name="password" />
        </Label>
        <Button type="submit">Sign In</Button>
      </Form>
    </div>
  );
}
