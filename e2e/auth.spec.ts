import { expect, test } from '@playwright/test';

test.describe('Auth JWT end-to-end', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => sessionStorage.clear());
  });

  test('redirects unauthenticated /home to /login', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  });

  test('invalid login shows error and stays on login', async ({ page }) => {
    await page.getByLabel('E-mail').fill('aluno@uesc.br');
    await page.getByLabel('Senha').fill('errada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha inválidos.');
    await expect(page).toHaveURL(/\/login/);
  });

  test('valid login stores token, opens home via /api/me with Bearer', async ({ page }) => {
    const meRequest = page.waitForRequest(
      (req) => req.url().includes('/api/me') && req.method() === 'GET'
    );

    await page.getByLabel('E-mail').fill('aluno@uesc.br');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByText('aluno@uesc.br')).toBeVisible();

    const token = await page.evaluate(() => sessionStorage.getItem('accessToken'));
    expect(token).toBeTruthy();

    const request = await meRequest;
    expect(request.headers()['authorization']).toBe(`Bearer ${token}`);
  });

  test('logout clears session and returns to login', async ({ page }) => {
    await page.getByLabel('E-mail').fill('aluno@uesc.br');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/home/);

    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/login/);

    const token = await page.evaluate(() => sessionStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });
});
