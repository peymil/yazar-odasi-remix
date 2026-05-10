import {
  PrismaClient,
  competition,
  user,
  user_profile,
  user_profile_project,
  company,
  company_user,
  project_genre,
  project_tag,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const AVAILABLE_GENRES: { slug: string; tr: string; en: string }[] = [
  { slug: 'drama',           tr: 'Drama',           en: 'Drama' },
  { slug: 'comedy',          tr: 'Komedi',          en: 'Comedy' },
  { slug: 'thriller',        tr: 'Gerilim',         en: 'Thriller' },
  { slug: 'action',          tr: 'Aksiyon',         en: 'Action' },
  { slug: 'romance',         tr: 'Romantik',        en: 'Romance' },
  { slug: 'horror',          tr: 'Korku',           en: 'Horror' },
  { slug: 'science_fiction', tr: 'Bilim Kurgu',     en: 'Science Fiction' },
  { slug: 'fantasy',         tr: 'Fantastik',       en: 'Fantasy' },
  { slug: 'mystery',         tr: 'Gizem',           en: 'Mystery' },
  { slug: 'documentary',     tr: 'Belgesel',        en: 'Documentary' },
  { slug: 'animation',       tr: 'Animasyon',       en: 'Animation' },
  { slug: 'historical',      tr: 'Tarihi',          en: 'Historical' },
  { slug: 'adventure',       tr: 'Macera',          en: 'Adventure' },
  { slug: 'crime',           tr: 'Suç',             en: 'Crime' },
  { slug: 'suspense',        tr: 'Süspans',         en: 'Suspense' },
];

const AVAILABLE_TAGS: { slug: string; tr: string; en: string }[] = [
  { slug: 'adaptation',      tr: 'Uyarlama',            en: 'Adaptation' },
  { slug: 'original',        tr: 'Özgün',               en: 'Original' },
  { slug: 'character_driven',tr: 'Karakter Odaklı',     en: 'Character-Driven' },
  { slug: 'plot_driven',     tr: 'Olay Örgüsü Odaklı',  en: 'Plot-Driven' },
  { slug: 'dialogue_heavy',  tr: 'Diyalog Ağırlıklı',   en: 'Dialogue-Heavy' },
  { slug: 'visual_storytelling', tr: 'Görsel Anlatım', en: 'Visual Storytelling' },
  { slug: 'emotional',       tr: 'Duygusal',            en: 'Emotional' },
  { slug: 'dark',            tr: 'Karanlık',            en: 'Dark' },
  { slug: 'light_hearted',   tr: 'Neşeli',              en: 'Light-Hearted' },
  { slug: 'philosophical',   tr: 'Felsefi',             en: 'Philosophical' },
  { slug: 'coming_of_age',   tr: 'Büyüme Hikayesi',     en: 'Coming-of-Age' },
  { slug: 'ensemble',        tr: 'Topluluk',            en: 'Ensemble' },
  { slug: 'solo_protagonist',tr: 'Tek Kahraman',        en: 'Solo Protagonist' },
  { slug: 'international',   tr: 'Uluslararası',        en: 'International' },
  { slug: 'indie',           tr: 'Bağımsız',            en: 'Indie' },
  { slug: 'experimental',    tr: 'Deneysel',            en: 'Experimental' },
  { slug: 'narrative_driven',tr: 'Anlatı Odaklı',       en: 'Narrative-Driven' },
  { slug: 'non_linear',      tr: 'Doğrusal Olmayan',    en: 'Non-Linear' },
];

export async function ensureGenresAndTags(prisma: PrismaClient) {
  const genres = await Promise.all(
    AVAILABLE_GENRES.map(async (g) => {
      const genre = await prisma.project_genre.upsert({
        where: { slug: g.slug },
        update: {},
        create: { slug: g.slug },
      });
      for (const [language, genre_name] of [['tr', g.tr], ['en', g.en]] as const) {
        await prisma.genre_translation.upsert({
          where: { genre_id_language: { genre_id: genre.id, language } },
          update: { genre_name },
          create: { genre_id: genre.id, language, genre_name },
        });
      }
      return genre;
    })
  );

  const tags = await Promise.all(
    AVAILABLE_TAGS.map(async (t) => {
      const tag = await prisma.project_tag.upsert({
        where: { slug: t.slug },
        update: {},
        create: { slug: t.slug },
      });
      for (const [language, tag_name] of [['tr', t.tr], ['en', t.en]] as const) {
        await prisma.tag_translation.upsert({
          where: { tag_id_language: { tag_id: tag.id, language } },
          update: { tag_name },
          create: { tag_id: tag.id, language, tag_name },
        });
      }
      return tag;
    })
  );

  return { genres, tags };
}

function selectRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export interface MockUserResult {
  user: user;
  profile: user_profile;
  projects: user_profile_project[];
  company_user?: company_user;
}

export async function createMockUserWithProfileExperienceAndProjects(
  prisma: PrismaClient,
  {
    company_id,
    createCompetitionApplicationCount,
    genres,
    tags,
  }: {
    company_id?: number;
    createCompetitionApplicationCount?: number[];
    genres: project_genre[];
    tags: project_tag[];
  }
): Promise<MockUserResult> {
  return await prisma.$transaction(async (tx) => {
    // Create user
    const mockUser = await tx.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    });

    // Create user profile
    const mockProfile = await tx.user_profile.create({
      data: {
        user_id: mockUser.id,
        name: faker.person.fullName(),
        contact_email: faker.internet.email(),
        about: faker.lorem.paragraph(),
        current_title: faker.person.jobTitle(),
      },
    });

    // Create projects with genres and tags
    const projectCount = faker.number.int({ min: 1, max: 3 });
    const mockProjects = await Promise.all(
      Array.from({ length: projectCount }, () =>
        (async () => {
          const project = await tx.user_profile_project.create({
            data: {
              profile_id: mockProfile.id,
              plot_title: faker.lorem.words({ min: 2, max: 5 }),
              synopsis: faker.lorem.paragraph(),
              logline: faker.lorem.sentence(),
              type: faker.helpers.arrayElement([
                'Feature Film',
                'TV Series',
                'Short Film',
                'Web Series',
              ]),
              hook: faker.lorem.sentence(),
              similar_works: faker.lorem.words({ min: 2, max: 4 }),
              setting: `${faker.location.city()}, ${faker.date
                .future()
                .getFullYear()}`,
            },
          });

          // Add at least 3 genres to the project
          const projectGenres = selectRandomItems(genres, Math.max(3, faker.number.int({ min: 3, max: 5 })));
          await Promise.all(
            projectGenres.map((genre) =>
              tx.project_projectgenre.create({
                data: {
                  project_id: project.id,
                  project_genre_id: genre.id,
                },
              })
            )
          );

          // Add at least 3 tags to the project
          const projectTags = selectRandomItems(tags, Math.max(3, faker.number.int({ min: 3, max: 5 })));
          await Promise.all(
            projectTags.map((tag) =>
              tx.project_projecttag.create({
                data: {
                  project_id: project.id,
                  project_tag_id: tag.id,
                },
              })
            )
          );

          return project;
        })()
      )
    );

    let mockCompanyUser: company_user | undefined;
    if (company_id) {
      mockCompanyUser = await tx.company_user.create({
        data: {
          user_id: mockUser.id,
          company_id: company_id,
        },
      });
    }

    return {
      user: mockUser,
      profile: mockProfile,
      projects: mockProjects,
      company_user: mockCompanyUser,
    };
  });
}

export async function createMockCompany(
  prisma: PrismaClient
): Promise<company> {
  const companyData = {
    email: faker.internet.email(),
    name: faker.company.name(),
    avatar: faker.image.avatar(),
  };

  return await prisma.company.create({
    data: companyData,
  });
}

const COMPETITION_TITLES = [
  'Türkiye Senaryo Ödülleri',
  'Genç Kalemler Senaryo Yarışması',
  'Uluslararası Kısa Film Senaryosu Yarışması',
  'Ulusal Uzun Metraj Senaryo Yarışması',
  'Fantastik & Bilim-Kurgu Senaryo Ödülü',
  'Sosyal Sorumluluk Senaryosu Yarışması',
  'Kadın Yönetmenler Senaryo Yarışması',
  'Gelecek Sesler: Yeni Yazarlar Yarışması',
  'Bağımsız Sinema Senaryo Ödülleri',
  'Dijital İçerik Yaratıcıları Yarışması',
  'Anadolu Hikayeleri Senaryo Yarışması',
  'Türk Dizi Senaryosu Yarışması',
];

const CONTENT_TYPES = [
  'Uzun Metraj Film',
  'Kısa Film',
  'TV Dizisi',
  'Web Serisi',
  'Belgesel',
  'Animasyon',
];

export async function createCompetition(
  prisma: PrismaClient,
  company_id: number
): Promise<competition> {
  const startDate = faker.date.between({
    from: new Date('2026-01-01'),
    to: new Date('2026-06-30'),
  });
  const endDate = faker.date.between({
    from: startDate,
    to: new Date('2026-12-31'),
  });

  const title = faker.helpers.arrayElement(COMPETITION_TITLES);
  const contentType = faker.helpers.arrayElement(CONTENT_TYPES);

  const description = [
    faker.lorem.paragraph(),
    faker.lorem.paragraph(),
    faker.lorem.paragraph(),
  ].join('\n\n');

  return await prisma.competition.create({
    data: {
      title,
      company_id,
      description,
      start_date: startDate,
      end_date: endDate,
      content_type: contentType,
      avatar: `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/400/300`,
    },
  });
}
