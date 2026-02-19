import {
  PrismaClient,
  competition,
  user,
  user_profile,
  user_profile_experience,
  user_profile_project,
  company,
  company_user,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function createMockUserWithProfileExperienceAndProjects(
  prisma: PrismaClient,
  {
    company_id,
    createCompetitionApplicationCount,
  }: {
    company_id?: number;
    createCompetitionApplicationCount?: number[];
  }
): Promise<{
  user: user;
  profile: user_profile;
  experiences: user_profile_experience[];
  projects: user_profile_project[];
  company_user?: company_user;
}> {
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
        background_image: faker.image.url(),
      },
    });

    // Create experiences
    const experienceCount = faker.number.int({ min: 1, max: 4 });
    const mockExperiences = await Promise.all(
      Array.from({ length: experienceCount }, () =>
        tx.user_profile_experience.create({
          data: {
            profile_id: mockProfile.id,
            title: faker.person.jobTitle(),
            company_name: faker.company.name(),
            location: `${faker.location.city()}, ${faker.location.state()}`,
            description: faker.lorem.paragraph(),
            start_date: faker.date.past(),
            end_date: faker.helpers.maybe(() => faker.date.recent(), {
              probability: 0.7,
            }),
          },
        })
      )
    );

    // Create projects
    const projectCount = faker.number.int({ min: 1, max: 3 });
    const mockProjects = await Promise.all(
      Array.from({ length: projectCount }, () =>
        tx.user_profile_project.create({
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
        })
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
      experiences: mockExperiences,
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
