import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/.server/prisma";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const project = await prisma.user_profile_project.findUniqueOrThrow({
    where: {
      id: Number(params.projectId),
    },
    include: {
      user_profile_project_characters: true,
      project_projecttag: { include: { project_tag: true } },
      project_projectgenre: { include: { project_genre: true } },
    },
  });

  const { user } = await prisma.user_profile.findFirstOrThrow({
    where: {
      id: project.profile_id!,
    },
    select: {
      user: true,
    },
  });

  return {
    project,
    user,
  };
}

export default function Layout() {
  const { project, user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{project.plot_title}</h1>
      {project.project_projectgenre.map(({ project_genre }) => (
        <span key={project_genre.id}>{project_genre.genre_name}</span>
      ))}
      <h2>{user.name}</h2>
      <div className={"grid-cols-2 grid gap-4"}>
        <div>
          <h1>Logline</h1>
          <p>{project.logline}</p>
        </div>
        <div>
          <h1>Zaman/Mekan</h1>
          <p>{project.setting}</p>
        </div>
        {project.user_profile_project_characters.map((character, i) => (
          <div key={character.id}>
            {i === 0 && <h1>Karakterler</h1>}
            <h1>{character.name}</h1>
            <p>{character.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
