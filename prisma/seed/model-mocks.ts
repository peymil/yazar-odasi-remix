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

export async function createCompetition(
  prisma: PrismaClient
): Promise<competition> {
  const startDate = faker.date.future();
  return await prisma.competition.create({
    data: {
      title: `${faker.word.adjective()} ${faker.word.noun()} Screenwriting Competition`,
      company_id: 1,
      description: faker.lorem.paragraph(),
      start_date: startDate,
      end_date: faker.date.future({ refDate: startDate }),
      avatar: faker.image.avatar(),
    },
  });
}
