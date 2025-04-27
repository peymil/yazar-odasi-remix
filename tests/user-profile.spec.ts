import { authedTest,expect } from "./auth.fixture";

authedTest("user-profile add project", async ({ page }) => {
    await page.getByRole('button', { name: 'Proje ekle' }).click();
    await page.getByText('Proje Adı').click();
    await page.getByRole('dialog').press('CapsLock');
    const projectName = page.getByRole('textbox', { name: 'Proje Adı' })
    await projectName.click();
    await projectName.fill('em');
    await projectName.press('CapsLock');
    await projectName.fill('Easdfasfgddasg');
    const projectSynopsis = page.getByRole('textbox', { name: 'Proje Synopsis' })
    await projectSynopsis.click();
    await projectSynopsis.fill('asfgasfhasfhasfh');
    const projectLogline = page.getByRole('textbox', { name: 'Proje Logline' })
    await projectLogline.click();
    await projectLogline.fill('d');
    await projectLogline.click();
    await projectLogline.fill('dasfdsadgas');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Kitap' }).click();
    await page.locator('div').filter({ hasText: /^Etiket seçiniz\.\.\.$/ }).nth(1).click();
    await page.locator('div').filter({ hasText: /^Etiket seçiniz\.\.\.$/ }).click();
    await page.getByText('activism').click();
    await page.getByText('academia').click();
    await page.getByText('adaptations').click();
    await page.locator('div').filter({ hasText: /^Karakterler$/ }).first().click();
    await page.locator('div').filter({ hasText: /^Tür seçiniz\.\.\.$/ }).nth(1).click();
    await page.getByText('Mystery').click();
    await page.getByText('Fantasy').click();
    await page.getByText('Thriller').click();
    await page.locator('div').filter({ hasText: /^Karakterler$/ }).first().click();
    await page.getByRole('textbox', { name: 'Hook' }).click();
    await page.getByRole('textbox', { name: 'Hook' }).fill('sadfasdg');
    await page.getByRole('textbox', { name: 'Benzer İşler' }).click();
    await page.getByRole('textbox', { name: 'Benzer İşler' }).fill('sadfsadg');
    await page.getByRole('textbox', { name: 'Zaman/Mekan' }).click();
    await page.getByRole('textbox', { name: 'Zaman/Mekan' }).fill('adfsadgsadg');
    await page.locator('.flex-1 > .flex > .inline-flex').click();
    await page.getByRole('textbox', { name: 'Karakter Adı' }).click();
    await page.getByRole('textbox', { name: 'Karakter Adı' }).fill('dasdgsadgasdgf');
    await page.getByRole('textbox', { name: 'Karakter Açıklaması' }).click();
    await page.getByRole('textbox', { name: 'Karakter Açıklaması' }).fill('asdgasdfasdg');
    await page.getByRole('button', { name: 'Yeni Karakter Ekle' }).click();
    await page.locator('input[name="user_profile_project_characters\\[1\\]\\[name\\]"]').click();
    await page.locator('input[name="user_profile_project_characters\\[1\\]\\[name\\]"]').fill('asdgasdgadsf');
    await page.locator('textarea[name="user_profile_project_characters\\[1\\]\\[description\\]"]').click();
    await page.locator('textarea[name="user_profile_project_characters\\[1\\]\\[description\\]"]').fill('asddsagasdg');
    await page.getByRole('button', { name: 'Yeni Karakter Ekle' }).click();
    await page.locator('input[name="user_profile_project_characters\\[2\\]\\[name\\]"]').click();
    await page.locator('input[name="user_profile_project_characters\\[2\\]\\[name\\]"]').fill('dasdfsadg');
    await page.locator('textarea[name="user_profile_project_characters\\[2\\]\\[description\\]"]').click();
    await page.locator('textarea[name="user_profile_project_characters\\[2\\]\\[description\\]"]').fill('asdgsadg');
    await page.getByRole('button', { name: 'Onayla' }).click();
})