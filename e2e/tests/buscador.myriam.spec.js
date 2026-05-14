import { test, expect } from '@playwright/test';

test.describe('Flujo de Buscador — Sistema Espina Bífida', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('ADMIN@tec.mx');
    await page.locator('input[type="password"]').fill('1234');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/usuarios/, { timeout: 10000 });
  });

  test('TC-01 Búsqueda de paciente existente', async ({ page }) => {
    await page.locator('input[placeholder="Buscar paciente"]').fill('Kevin Rosas');

    await page.waitForTimeout(1000);

    const tarjetas = page.locator('.usuarios-grid .card');
    await expect(tarjetas).not.toHaveCount(0);
  });

  test('TC-02 Búsqueda de paciente que no existe', async ({ page }) => {
    const respuestaPromise = page.waitForResponse(resp =>
      resp.url().includes('/api/pacientes/cards') && resp.status() === 200
    );

    await page.locator('input[placeholder="Buscar paciente"]').fill('xxxxxxxxxxx');

    await respuestaPromise;

    const tarjetas = page.locator('.usuarios-grid .card');
    await expect(tarjetas).toHaveCount(0);
  });

});
