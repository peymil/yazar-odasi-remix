import { faker } from '@faker-js/faker';
import { test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export * from '@playwright/test';
export const authedTest = baseTest.extend<{}, { workerStorageState: string }>({
  page: async ({ baseURL, page }, use) => {
    await page.goto(baseURL!);
    await use(page);
  },
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [async ({ browser }, use) => {
    // Use parallelIndex as a unique identifier for each worker.
    const id = authedTest.info().parallelIndex;
    const fileName = path.resolve(authedTest.info().project.outputDir, `.auth/${id}.json`);

    if (fs.existsSync(fileName)) {
      // Reuse existing authentication state if any.
      await use(fileName);
      return;
    }

    const page = await browser.newPage({ storageState: undefined , baseURL: 'http://localhost:5173' });
  
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Enter your email' }).click();
    await page.getByRole('textbox', { name: 'Enter your email' }).fill(faker.internet.email());
    await page.getByRole('textbox', { name: 'Enter your full name' }).fill(faker.name.fullName());
    await page.locator('div').filter({ hasText: /^Password$/ }).click();
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(faker.internet.password());
    const waitForNavigation = page.waitForNavigation();
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await waitForNavigation;

    await page.context().storageState({ path: fileName });
    await page.close();
    await use(fileName);
  }, { scope: 'worker' }],
});