import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(18, 'Login exitoso - Admin'), async ({ page }) => {
  await page.goto('/login');

  // Llenar campos con credenciales de admin
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).fill('admin@tec.mx');
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');

  // Hacer clic en iniciar sesión
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Verificar que navegue a la página de usuarios
  await expect(page).toHaveURL(/\/usuarios$/);

  // Verificar que no haya mensaje de error
  await expect(page.getByText('Credenciales incorrectas')).not.toBeVisible();
  await expect(page.getByText('Completa todos los campos')).not.toBeVisible();
});