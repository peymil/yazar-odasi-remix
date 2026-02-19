import { LoaderFunctionArgs } from 'react-router';
import { prisma } from '~/.server/prisma';
import { useLoaderData } from 'react-router';
import { Route } from './+types/route';

export async function loader({ params }: Route.ActionArgs) {
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

  return {
    project,
  };
}

export default function Layout() {
  const { project } = useLoaderData<typeof loader>();

  return (
    <div className={'container mx-auto'}>
      <h2 className={'font-bold'}>{project.plot_title}</h2>
      <div className={'flex flex-col gap-5'}>
        <div className={'flex gap-4'}>
          <div className={'flex-1'}>
            <h3 className={'text-lg font-bold'}>Logline</h3>
            <p className={'text-sm'}>{project.logline}</p>
          </div>
          <div className={'flex-1'}>
            <h3 className={'text-lg font-bold'}>Zaman/Mekan</h3>
            <p className={'text-sm'}>{project.setting}</p>
          </div>
        </div>

        <div>
          <h3 className={'text-lg font-bold'}>Hook</h3>
          <p className={'text-sm'}>{project.hook}</p>
        </div>
        <div>
          <h3 className={'text-lg font-bold'}>Synopsis</h3>
          <p className={'text-sm'}>{project.synopsis}</p>
        </div>

        <div>
          <h3 className={'mb-2 text-lg flex font-bold'}>Karakterler</h3>
          <div className={'grid gap-1'}>
            {project.user_profile_project_characters.map((character) => (
              <p key={character.id} className={'text-sm block'}>
                <span className={'text-yo-sub-title'}>{character.name}</span>:{' '}
                {character.description}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
