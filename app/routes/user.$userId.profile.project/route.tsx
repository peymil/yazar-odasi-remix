import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { profileProjectUpdateSchema } from "~/.server/schemas/profile-project-update.schema";
import { prisma } from "~/.server/prisma";
import { profileProjectCreateSchema } from "~/.server/schemas/profile-project-create.schema";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Form } from "@remix-run/react";

export async function action({ request, context }: ActionFunctionArgs) {
  const method = request.method;
  const body = Object.fromEntries(await request.formData());
  console.log("method", method);
  const currentUser = context.user;
  if (method === "PATCH") {
    const { user_profile_project_characters, ...payload } =
      profileProjectUpdateSchema.parse(body);
    const profile = await prisma.user_profile.findFirstOrThrow({
      where: {
        user_id: Number(currentUser.id),
      },
    });
    const project = await prisma.user_profile_project.findFirstOrThrow({
      where: {
        id: Number(profile.id),
      },
    });
    await prisma.user_profile_project.update({
      where: {
        id: project.id,
      },
      data: {
        ...payload,
      },
    });
  } else if (method === "POST") {
    const { user_profile_project_characters, ...payload } =
      profileProjectCreateSchema.parse(body);
    const profile = await prisma.user_profile.findFirstOrThrow({
      where: {
        user_id: Number(currentUser.id),
      },
    });
    await prisma.user_profile_project.create({
      data: {
        ...payload,
        profile_id: profile.id,
        user_profile_project_characters: {
          createMany: { data: user_profile_project_characters },
        },
      },
    });
  } else {
    throw new Error("Method not allowed");
  }
  redirect("..");
}

export default function Layout() {
  return (
    <Form method={"POST"} className={"flex flex-col"}>
      <Label htmlFor="title">Title:</Label>
      <Input name="title" type="text" required className={"mb-8"} />
      <Label htmlFor="description">Description:</Label>
      <Input name="description" type="text" required className={"mb-8"} />
      <Label htmlFor="link">Link:</Label>
      <Input name="link" type="text" required className={"mb-8"} />
      <Button>Save</Button>
    </Form>
  );
}
