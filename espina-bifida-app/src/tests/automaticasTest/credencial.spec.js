import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-3 Carga correcta de credencial', async ({ page }) => {
  qase.id(3);

  // ---- PASO 1: LOGIN ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- PASO 2: ESCOGER PACIENTE (click en Detalle) ----
  await page.getByRole('button', { name: /detalle/i }).first().click();

  // ---- PASO 3: PRESIONAR "Ver Credencial" ----
  await page.getByRole('button', { name: 'Ver Credencial' }).click();

  // ---- VERIFICAR LA CREDENCIAL ----
  // El contenedor rectangular de la credencial está visible
  await expect(page.locator('.credencial')).toBeVisible();

  // Los datos/etiquetas del paciente se muestran en el formato correcto
  await expect(page.getByText('Nombre:')).toBeVisible();
  await expect(page.getByText('Folio:')).toBeVisible();
  await expect(page.getByText('Tipo de Sangre:')).toBeVisible();

  // El logo de la asociación confirma el formato de credencial
  await expect(page.getByText('ASOCIACIÓN DE ESPINA BÍFIDA DE N.L. A.B.P.')).toBeVisible();
});