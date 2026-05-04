import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(17, 'Login fallido - campos vacíos'), async ({ page }) => {
  await page.goto('/login');

  // Dejar campos vacíos y hacer clic en iniciar sesión
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Verificar que aparezca el mensaje de error
  await expect(page.getByText('Completa todos los campos')).toBeVisible();

  // Verificar que siga en la página de login
  await expect(page).toHaveURL(/\/login$/);
});