import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-1 Visualización correcta de historial', async ({ page }) => {
  qase.id(1);

  // ---- 1. LOGIN ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- 2. CLICK EN "Detalle" DE LA PRIMERA TARJETA ----
  await page.getByRole('button', { name: /detalle/i }).first().click();

  // ---- 3. CLICK EN TAB "Recibos" ----
  await page.getByRole('button', { name: /recibos/i }).click();

  // ---- 4. VERIFICAR EL HISTORIAL ----
  await expect(page.getByRole('heading', { name: 'Historial de servicios' })).toBeVisible();
});