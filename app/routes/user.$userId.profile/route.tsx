import React from "react";
import WriterProfile from "@/components/WriterProfile";
import {
  baseExperienceQuery,
  baseGenreQuery,
  baseProfileQuery,
  baseProjectQuery,
  baseTagQuery,
  baseUserQuery,
} from "@/utils/queries";
import { kys } from "@/utils/kysely/server";
import { auth } from "@/auth";
import { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import {prisma} from "~/.server/prisma";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId is required");
  const { userId } = params;
  const session = await auth();

  prisma.users

  const user = await baseUserQuery
    .where("id", "=", Number(userId))
    .executeTakeFirstOrThrow();
  const profile = await baseProfileQuery
    .where("user_id", "=", Number(userId))
    .executeTakeFirstOrThrow();
  const projects = await baseProjectQuery
    .where("profile_id", "=", profile.id)
    .execute();
  const experiences = await baseExperienceQuery
    .where("profile_id", "=", profile.id)
    .execute();
  const tags = await baseTagQuery.execute();
  const genres = await baseGenreQuery.execute();

  return {
    user,
    profile,
    projects,
    experiences,
    tags,
    genres,
  };
}

export default async function WritersPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;
  const session = await auth();

  const user = await baseUserQuery
    .where("id", "=", Number(userId))
    .executeTakeFirstOrThrow();
  const profile = await baseProfileQuery
    .where("user_id", "=", Number(userId))
    .executeTakeFirstOrThrow();
  const projects = await baseProjectQuery
    .where("profile_id", "=", profile.id)
    .execute();
  const experiences = await baseExperienceQuery
    .where("profile_id", "=", profile.id)
    .execute();
  const tags = await baseTagQuery.execute();
  const genres = await baseGenreQuery.execute();
  const isUsersProfile = Number(session?.user?.id) === Number(userId);

  async function createProfile(formData: FormData & { plot_title: string }) {
    "use server";
    const plot_title = formData.get("plot_title");
    const synopsis = formData.get("synopsis") as string;
    const type = formData.get("type") as string;
    const logline = formData.get("logline") as string;
    const hook = formData.get("hook") as string;
    const similar_works = formData.get("similar_works") as string;
    const tags = formData.getAll("tags") as string[];
    const genres = formData.getAll("genres") as string[];
    const project = await kys
      .insertInto("user_profile_project")
      .values({
        plot_title,
        synopsis,
        profile_id: profile.id,
        type,
        logline,
        hook,
        similar_works,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    await kys
      .insertInto("project_projecttag")
      .values(
        tags.map((tag) => ({
          project_tag_id: Number(tag),
          project_id: project.id,
        }))
      )
      .execute();
    await kys
      .insertInto("project_projectgenre")
      .values(
        genres.map((genre) => ({
          project_genre_id: Number(genre),
          project_id: project.id,
        }))
      )
      .execute();
  }

  async function createExperience(formData: FormData) {
    "use server";
    await kys
      .insertInto("user_profile_experience")
      .values({
        location: formData.get("location") as string,
        start_date: new Date(formData.get("start_date") as string),
        end_date: new Date(formData.get("end_date") as string),
        description: formData.get("description") as string,
        title: formData.get("title") as string,
        profile_id: profile.id,
        company_name: formData.get("company_name") as string,
      })
      .execute();
  }

  async function updateAbout(formData: FormData) {
    "use server";
    await kys
      .updateTable("user_profile")
      .where("id", "=", profile.id)
      .set({
        about: formData.get("about") as string,
      })
      .execute();
  }

  return (
    <WriterProfile
      profile={profile}
      user={user}
      projects={projects}
      experiences={experiences}
      mutateProfileAction={createProfile}
      mutateExperienceAction={createExperience}
      tags={tags}
      genres={genres}
      isUsersProfile={isUsersProfile}
      mutateAboutAction={updateAbout}
    />
  );
}
