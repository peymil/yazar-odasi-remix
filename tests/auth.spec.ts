import { faker } from "@faker-js/faker";
import { test,expect } from "@playwright/test";
const email  = faker.internet.email();
const password = faker.internet.password();


test.describe.serial("auth", () => {
    test("sign-up", async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Enter your email' }).click();
    await page.getByRole('textbox', { name: 'Enter your email' }).fill(faker.internet.email());
    await page.getByRole('textbox', { name: 'Enter your full name' }).fill(faker.name.fullName());
    await page.locator('div').filter({ hasText: /^Password$/ }).click();
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(faker.internet.password());
    const waitForNavigation = page.waitForNavigation();
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await waitForNavigation;
    await expect(page.getByRole("link", { name: "Profil" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Şirket Oluştur" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Çıkış Yap" })).toBeVisible();
})
test('sign-up mainpage', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await page.getByRole('textbox', { name: 'Enter your email' }).click();
    await page.getByRole('textbox', { name: 'Enter your email' }).fill(email);
    await page.getByRole('textbox', { name: 'Enter your full name' }).fill(faker.name.fullName());
    await page.locator('div').filter({ hasText: /^Password$/ }).click();
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(password);
    const waitForNavigation = page.waitForNavigation();
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await waitForNavigation;
    await expect(page.getByRole("link", { name: "Profil" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Şirket Oluştur" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Çıkış Yap" })).toBeVisible();
})

test('sign-in mainpage', async ({ page }) => {
    await page.goto('auth/sign-in');
    await page.getByRole('link', { name: 'Giriş Yap' }).click();
    await page.getByRole('textbox', { name: 'Enter your email' }).click();
    await page.getByRole('textbox', { name: 'Enter your email' }).fill(email);
    await page.getByRole('textbox', { name: 'Enter your password' }).click();
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole("link", { name: "Profil" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Şirket Oluştur" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Çıkış Yap" })).toBeVisible();
  });
});

