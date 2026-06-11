import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-20 Gestión de usuarios - eliminar', async ({ page }) => {
  qase.id(20);
  await page.setViewportSize({ width: 1920, height: 1080 });

  const sufijo = Date.now();
  const correo = `qaborrar${sufijo}@aebnl.mx`;

  // ---- LOGIN (admin) ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('admin@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- IR A GESTIÓN DE USUARIOS ----
  await page.getByRole('link', { name: 'Gestión de usuarios' }).click();

  // ---- CREAR USUARIO PARA BORRAR ----
  await page.getByRole('button', { name: /nuevo usuario/i }).click();
  await page.locator('input[name="nombre"]').fill('Usuario A Borrar');
  await page.locator('input[name="username"]').fill(correo);
  await page.locator('input[name="password"]').fill('Test1234@');
  await page.locator('input[name="confirmarPassword"]').fill('Test1234@');
  await page.locator('.role-card').first().click();
  await page.getByRole('button', { name: 'Crear usuario' }).click({ force: true });

  await expect(page.getByText(correo)).toBeVisible({ timeout: 10000 });

  // ---- BORRAR ESE USUARIO ----
  const fila = page.locator('tr', { hasText: correo });
  await fila.locator('.btn-borrar').click();

  // ---- CONFIRMAR EN EL MODAL PROPIO (no es confirm() del browser) ----
  // El modal muestra "Sí, eliminar"
  const btnConfirmar = page.getByRole('button', { name: /sí, eliminar/i });
  await expect(btnConfirmar).toBeVisible({ timeout: 5000 });
  await btnConfirmar.click();

  // ---- VERIFICAR QUE LA FILA DESAPARECE ----
  await expect(fila).not.toBeAttached({ timeout: 15000 });
});