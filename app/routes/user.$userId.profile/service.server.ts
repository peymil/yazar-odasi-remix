import { prisma } from '~/.server/prisma';
import { user_profile_project } from '@prisma/client';

export function getProject(
  profileId: number
): Promise<(user_profile_project & { genres: string[]; tags: string[] })[]> {
  return prisma.user_profile_project
    .findMany({
      where: {
        profile_id: profileId,
      },
      include: {
        project_projectgenre: {
          include: {
            project_genre: true,
          },
        },
        project_projecttag: { include: { project_tag: true } },
      },
    })
    .then((projects) => {
      return projects.map(
        ({ project_projectgenre, project_projecttag, ...project }) => {
          return {
            ...project,
            genres: project_projectgenre.map(
              (genre) => genre.project_genre!.genre_name
            ),
            tags: project_projecttag.map((tag) => tag.project_tag!.tag_name),
          };
        }
      );
    });
}
