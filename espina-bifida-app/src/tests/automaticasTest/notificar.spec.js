import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-8 Notificar paciente pendiente', async ({ page }) => {
  qase.id(8);

  const rand = Array.from({ length: 3 }, () =>
    'BCDFGHJKLMNPQRSTVWXYZ'[Math.floor(Math.random() * 21)]
  ).join('');
  const curp = `GOML901012MNL${rand}09`;
  const nombre = `TestQA ${rand}`;

  // ---- 1. ENTRAR COMO INVITADO ----
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Ingresar como invitado' }).click();
  await expect(page).toHaveURL(/.*registro/);

  // ---- 2. PASO 1: NOMBRE + CURP ----
  await page.locator('input[name="nombres"]').fill(nombre);
  await page.locator('input[name="curp"]').fill(curp);

  // ---- AVANZAR LOS 5 PASOS ----
  // Esperamos que cada botón esté visible antes de hacer click
  // para asegurarnos de que el paso anterior se procesó
  await page.locator('.btn-siguiente').click(); // paso 1 -> 2
  await expect(page.locator('.btn-siguiente')).toBeVisible({ timeout: 5000 });

  await page.locator('.btn-siguiente').click(); // 2 -> 3
  await expect(page.locator('.btn-siguiente')).toBeVisible({ timeout: 5000 });

  await page.locator('.btn-siguiente').click(); // 3 -> 4
  await expect(page.locator('.btn-siguiente')).toBeVisible({ timeout: 5000 });

  await page.locator('.btn-siguiente').click(); // 4 -> 5
  
  // ---- 3. FINALIZAR ----
  // Esperar que aparezca el botón finalizar antes de hacer click
  await expect(page.locator('.btn-finalizar')).toBeVisible({ timeout: 5000 });
  await page.locator('.btn-finalizar').click();

  // Esperar el mensaje de éxito con más tiempo (puede ser una llamada a API)
  await expect(page.getByText('¡Registro guardado exitosamente!')).toBeVisible({ timeout: 15000 });

  // ---- 4. VOLVER E INICIAR SESIÓN COMO ADMIN ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- 5. IR A NOTIFICACIONES Y VERIFICAR ----
  await page.goto('http://localhost:3000/notificaciones');
  await expect(page.getByText(`Registro pendiente — ${nombre}`)).toBeVisible({ timeout: 10000 });
});