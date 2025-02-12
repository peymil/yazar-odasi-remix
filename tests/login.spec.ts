import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';

test('login', async ({ page,browser }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'Enter your email' }).click();
  await page.getByRole('textbox', { name: 'Enter your email' }).fill(faker.internet.email());
  await page.getByRole('textbox', { name: 'Enter your full name' }).fill(faker.name.fullName());
  await page.locator('div').filter({ hasText: /^Password$/ }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill(faker.internet.password());
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect( page.getByRole('link', { name: 'Profil' })).toBeVisible()
  await expect( page.getByRole('link', { name: 'Şirket Oluştur' })).toBeVisible()
  await expect( page.getByRole('link', { name: 'Çıkış Yap' })).toBeVisible()
});