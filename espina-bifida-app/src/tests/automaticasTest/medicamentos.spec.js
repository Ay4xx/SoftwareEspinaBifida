import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-4 Asignación de medicamentos', async ({ page }) => {
  qase.id(4);

  // ---- LOGIN ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- ESCOGER PACIENTE ----
  await page.getByRole('button', { name: /detalle/i }).first().click();

  // ---- IR A TAB "Medicamentos" ----
  await page.getByRole('button', { name: /medicamentos/i }).click();

  // ---- ABRIR POPUP DE SELECCIÓN ----
  await page.getByRole('button', { name: /agregar/i }).click();

  // ---- ESPERAR EL POPUP Y SELECCIONAR EL PRIMER MEDICAMENTO ----
  await expect(page.getByRole('heading', { name: 'Seleccionar Medicamentos' })).toBeVisible();
  await page.locator('.med-popup-item').first().click();

  // ---- CONFIRMAR SELECCIÓN (botón "Agregar (N)") ----
  await page.getByRole('button', { name: /^Agregar \(/ }).click();

  // ---- VERIFICAR QUE SE DESPLIEGA EL COSTO TOTAL ----
  await expect(page.locator('.med-total')).toBeVisible();
  await expect(page.getByText('Total')).toBeVisible();

  // ---- GUARDAR LA CONSULTA ----
  await page.getByRole('button', { name: 'Guardar Consulta' }).click();

  // ---- VERIFICAR POPUP DE ÉXITO ----
  await expect(page.getByRole('heading', { name: '¡Registro guardado!' })).toBeVisible();
});