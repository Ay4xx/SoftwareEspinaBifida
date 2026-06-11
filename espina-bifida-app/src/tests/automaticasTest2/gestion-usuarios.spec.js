import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-18 Gestión de usuarios - crear perfil', async ({ page }) => {
  qase.id(18);
  await page.setViewportSize({ width: 1920, height: 1080 });

  const sufijo = Date.now();
  const correo = `qatest${sufijo}@aebnl.mx`;

  // ---- LOGIN (admin) ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('admin@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- IR A GESTIÓN DE USUARIOS ----
  await page.getByRole('link', { name: 'Gestión de usuarios' }).click();

  // ---- 1. NUEVO USUARIO ----
  await page.getByRole('button', { name: /nuevo usuario/i }).click();

  // ---- 2. NOMBRE Y CORREO ----
  await page.locator('input[name="nombre"]').fill('Usuario QA Test');
  await page.locator('input[name="username"]').fill(correo);

  // ---- 3. CONTRASEÑA ----
  await page.locator('input[name="password"]').fill('Test1234@');
  await page.locator('input[name="confirmarPassword"]').fill('Test1234@');

  // ---- 4. TIPO DE USUARIO ----
  await page.locator('.role-card').first().click();

  // ---- 5. CREAR USUARIO ----
  await page.getByRole('button', { name: 'Crear usuario' }).click({ force: true });

  // ---- VERIFICAR ----
  await expect(page.getByText(correo)).toBeVisible();
});