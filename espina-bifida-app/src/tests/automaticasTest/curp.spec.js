import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-9 Validación de CURP', async ({ page }) => {
  qase.id(9);

  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Ingresar como invitado' }).click();
  await expect(page).toHaveURL(/.*registro/);

  await page.locator('input[name="curp"]').fill('GOML901012MNLLRR09');

  await expect(page.getByText('CURP con formato válido.')).toBeVisible();
});