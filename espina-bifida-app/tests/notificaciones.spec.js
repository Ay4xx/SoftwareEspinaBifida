import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test.describe('Flujo de Notificaciones', () => {

  test('HS01-11 - Aprobar notificación pendiente', async ({ page }) => {
    qase.id(11);
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"]', 'cordi@tec.mx');
    await page.fill('input[type="password"]', '1234');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/usuarios');
    await page.goto('http://localhost:3000/notificaciones');

    await expect(page.locator('.noti-card').first()).toBeVisible();
    const pendiente = page.locator('.estado-badge.pendiente').first();
    await expect(pendiente).toBeVisible();
    await page.locator('.noti-card').first().click();

    await page.waitForURL('**/registro');
    for (let i = 0; i < 4; i++) {
      await page.locator('.btn-siguiente').click();
      await page.waitForTimeout(500);
    }

    await page.locator('.btn-aprobar-revision').click();
    await expect(page.locator('.registro-exito')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.registro-exito h2')).toContainText('aprobado');
    await page.waitForURL('**/notificaciones');
  });

  test('HS01-12 - Búsqueda de notificación inexistente', async ({ page }) => {
    qase.id(12);
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"]', 'cordi@tec.mx');
    await page.fill('input[type="password"]', '1234');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/usuarios');
    await page.goto('http://localhost:3000/notificaciones');

    await page.fill('.noti-search input', 'XXXX000000XXXXXX00');

    await expect(page.locator('.sin-notificaciones').first()).toBeVisible();
    await expect(page.locator('.sin-notificaciones').first()).toContainText('No hay notificaciones');
  });

});