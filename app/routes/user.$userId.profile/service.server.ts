import { prisma } from '~/.server/prisma';
import { user_profile_project } from '@prisma/client';
import { getLocalizedGenres, getLocalizedTags, SupportedLocale } from '~/lib/i18n.server';

export async function getProject(
  profileId: number,
  locale: SupportedLocale = 'tr'
): Promise<(user_profile_project & { genres: string[]; tags: string[] })[]> {
  const [projects, allGenres, allTags] = await Promise.all([
    prisma.user_profile_project
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
      }),
    getLocalizedGenres(locale),
    getLocalizedTags(locale),
  ]);
  const genreNameMap = new Map(allGenres.map((g) => [g.id, g.name]));
  const tagNameMap = new Map(allTags.map((t) => [t.id, t.name]));
  return projects.map(
    ({ project_projectgenre, project_projecttag, ...project }) => ({
      ...project,
      genres: project_projectgenre.map(
        (genre) => genreNameMap.get(genre.project_genre!.id) ?? genre.project_genre!.slug
      ),
      tags: project_projecttag.map(
        (tag) => tagNameMap.get(tag.project_tag!.id) ?? tag.project_tag!.slug
      ),
    })
  );
}
