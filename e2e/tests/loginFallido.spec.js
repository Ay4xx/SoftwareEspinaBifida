import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(16, 'Login fallido'), async ({ page }) => {
  await page.goto('/login');
  await page
    .getByRole('textbox', { name: 'maria.garcia@email.com' })
    .fill('maria.garce@tec.mx');
  await page
    .getByRole('textbox', { name: '••••••••' })
    .fill('contraseña');
  await page
    .getByRole('button', { name: /iniciar sesión/i })
    .click();
  await expect(page.getByText('Credenciales incorrectas')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});