/**
 * Server-side i18n utility for genres and tags.
 *
 * Translations are stored in genre_translation / tag_translation tables.
 * Falls back to slug if no translation is found.
 */

import { prisma } from '~/.server/prisma';

export type SupportedLocale = 'tr' | 'en';

export const DEFAULT_LOCALE: SupportedLocale = 'tr';

/**
 * Derive the locale from the Accept-Language header.
 * Only 'tr' and 'en' are supported; defaults to 'tr'.
 */
export function getLocaleFromRequest(request: Request): SupportedLocale {
  const acceptLanguage = request.headers.get('Accept-Language') ?? '';
  if (acceptLanguage.toLowerCase().startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

/**
 * Returns all genres with their localized name for the given locale.
 * Falls back to slug if no translation row exists.
 */
export async function getLocalizedGenres(locale: SupportedLocale) {
  const genres = await prisma.project_genre.findMany({
    orderBy: { slug: 'asc' },
    include: {
      translations: {
        where: { language: locale },
      },
    },
  });

  return genres.map((g) => ({
    id: g.id,
    slug: g.slug,
    name: g.translations[0]?.genre_name ?? g.slug,
  }));
}

/**
 * Returns all tags with their localized name for the given locale.
 * Falls back to slug if no translation row exists.
 */
export async function getLocalizedTags(locale: SupportedLocale) {
  const tags = await prisma.project_tag.findMany({
    orderBy: { slug: 'asc' },
    include: {
      translations: {
        where: { language: locale },
      },
    },
  });

  return tags.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.translations[0]?.tag_name ?? t.slug,
  }));
}

/**
 * Localizes a genre record that was already fetched with its
 * translations included (avoids an extra DB round-trip).
 */
export function localizeGenre(
  genre: { slug: string; translations: { language: string; genre_name: string }[] },
  locale: SupportedLocale
): string {
  return genre.translations.find((t) => t.language === locale)?.genre_name ?? genre.slug;
}

/**
 * Localizes a tag record that was already fetched with its
 * translations included (avoids an extra DB round-trip).
 */
export function localizeTag(
  tag: { slug: string; translations: { language: string; tag_name: string }[] },
  locale: SupportedLocale
): string {
  return tag.translations.find((t) => t.language === locale)?.tag_name ?? tag.slug;
}
