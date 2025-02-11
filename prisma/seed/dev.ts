import { PrismaClient } from '@prisma/client';
import {
  createMockCompany,
  createMockUserWithProfileExperienceAndProjects,
  createCompetition,
} from './model-mocks';
import { faker } from '@faker-js/faker';

async function main() {
  const prismaClient = new PrismaClient();

  // Companies
  const companies = await Promise.all(
    Array.from({ length: 10 }, () => {
      return createMockCompany(prismaClient);
    })
  );

  // Competitions
  const competitions = await Promise.all(
    Array.from({ length: 10 }, () => {
      return createCompetition(prismaClient);
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
