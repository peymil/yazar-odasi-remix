import { PrismaClient } from '@prisma/client';
import {
  createMockCompany,
  createMockUserWithProfileExperienceAndProjects,
  createCompetition,
} from './model-mocks';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

async function main() {
  const prismaClient = new PrismaClient();

  const existingCompany = await prismaClient.company.findFirst();
  if (existingCompany) {
    console.log('Database already seeded, skipping.');
    await prismaClient.$disconnect();
    return;
  }

  // Test user
  await prismaClient.user.create({
    data: {
      email: 'test@test.local',
      password: await bcrypt.hash('testtest', 14),
      emailVerified: true,
      user_profile: {
        create: {
          name: 'Test User',
          contact_email: 'test@test.local',
          about: 'This is a test account.',
          current_title: 'Senarист',
          user_profile_experience: {
            create: {
              title: 'Senarист',
              company_name: 'Test Studio',
              location: 'İstanbul, Türkiye',
              description: 'Test experience entry.',
              start_date: new Date('2020-01-01'),
            },
          },
          user_profile_project: {
            create: {
              plot_title: 'Test Projesi',
              synopsis: 'A test project synopsis.',
              logline: 'A test logline.',
              type: 'Feature Film',
              hook: 'An interesting hook.',
              similar_works: 'Test, Sample',
              setting: 'İstanbul, 2024',
            },
          },
        },
      },
    },
  });

  // Companies
  const companies = await Promise.all(
    Array.from({ length: 10 }, () => {
      return createMockCompany(prismaClient);
    })
  );

  // Competitions
  const competitions = await Promise.all(
    Array.from({ length: 10 }, () => {
      const randomCompany = companies[faker.number.int({ min: 0, max: companies.length - 1 })];
      return createCompetition(prismaClient, randomCompany.id);
    })
  );
  console.log(competitions);
  // Users
  Array.from({ length: 100 }, async () => {
    const user = await createMockUserWithProfileExperienceAndProjects(
      prismaClient,
      {
        company_id: faker.helpers.maybe(() => {
          return companies[
            faker.number.int({ min: 0, max: companies.length - 1 })
          ].id;
        }),
        // pick multipler values
        createCompetitionApplicationCount: Array.from(
          { length: faker.number.int({ min: 0, max: 3 }) },
          () => {
            return competitions[
              faker.number.int({ min: 0, max: competitions.length - 1 })
            ].id;
          }
        ),
      }
    );
  });
}

main();
