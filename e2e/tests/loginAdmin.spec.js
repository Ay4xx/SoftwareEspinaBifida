import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(15, 'Login Tipo Usuario Admin'), async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).click();
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).fill('admin@tec.mx');
  await page.getByRole('textbox', { name: '••••••••' }).dblclick();
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');
  await page.getByRole('button', { name: '↪ Iniciar sesión' }).click();
});