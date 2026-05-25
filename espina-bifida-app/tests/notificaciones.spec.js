// @ts-check
import { test, expect } from '@playwright/test';

// Función reutilizable para hacer login
async function login(page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).fill('cordi@tec.mx');
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page.getByText('Módulo de Usuarios')).toBeVisible({ timeout: 10000 });
}

async function irANotificaciones(page) {
  await page.locator('.icon-btn').click();
  await expect(page).toHaveURL(/\/notificaciones/, { timeout: 5000 });
}

test.describe('Flujo de Notificaciones', () => {

  test('[HS01-11] Aprobar notificación pendiente', async ({ page }) => {
    await login(page);
    await irANotificaciones(page);

    const tarjetaPendiente = page.locator('.noti-card').filter({
      has: page.locator('.estado-badge.pendiente'),
    }).first();
    await expect(tarjetaPendiente).toBeVisible({ timeout: 10000 });
    await tarjetaPendiente.click();

    await expect(page).toHaveURL(/\/registro/, { timeout: 5000 });
    await expect(page.getByText(/paso 1 de 5/i)).toBeVisible();

    for (let i = 1; i < 5; i++) {
      await page.locator('.btn-siguiente').click();
      await expect(page.getByText(new RegExp(`paso ${i + 1} de 5`, 'i'))).toBeVisible({ timeout: 5000 });
    }

    await page.getByRole('button', { name: /aprobar/i }).click();
    await expect(page.getByText(/aprobado exitosamente/i)).toBeVisible({ timeout: 10000 });
  });

  test('[HS01-12] Búsqueda de notificación inexistente', async ({ page }) => {
    await login(page);
    await irANotificaciones(page);

    const inputBusqueda = page.locator('.noti-search input');
    await expect(inputBusqueda).toBeVisible({ timeout: 5000 });
    await inputBusqueda.fill('XXXXXXXXXXX');

    await expect(page.getByText(/no hay notificaciones/i)).toBeVisible({ timeout: 5000 });
  });

  test('[HS01-16] Login fallido con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).fill('usuario@incorrecto.com');
    await page.getByRole('textbox', { name: '••••••••' }).fill('wrongpassword');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/credenciales incorrectas/i)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

});