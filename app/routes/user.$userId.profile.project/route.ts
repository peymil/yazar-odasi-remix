import { ActionFunctionArgs } from "@remix-run/node";
import {
  createProjectSchema,
  profileProjectUpdateSchema,
} from "~/.server/schemas/profile-project-update.schema";
import { prisma } from "~/.server/prisma";

export async function action({ request, context }: ActionFunctionArgs) {
  const method = request.method;
  const body = Object.fromEntries(await request.formData());
  const currentUser = context.user;
  if (method === "PATCH") {
    const payload = profileProjectUpdateSchema.parse(body);
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
      data: payload,
    });
  } else if (method === "POST") {
    const payload = createProjectSchema.parse(body);
    const profile = await prisma.user_profile.findFirstOrThrow({
      where: {
        user_id: Number(currentUser.id),
      },
    });
    await prisma.user_profile_project.create({
      data: { ...payload, profile_id: profile.id },
    });
  } else {
    throw new Error("Method not allowed");
  }
}
