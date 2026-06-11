import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-17 Agregar cita a la agenda', async ({ page }) => {
  qase.id(17);

  // ---- LOGIN (coordinador) ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- 1. ENTRAR AL MÓDULO DE AGENDA ----
  await page.getByRole('link', { name: 'Agenda' }).click();
  await expect(page).toHaveURL(/.*agendacitas/);

  // ---- 2. CLICK EN "Agregar Cita" ----
  await page.getByRole('button', { name: /agregar cita/i }).click();

  // ---- 3. LLENAR CAMPOS ----
  // Escribir el nombre poco a poco para darle tiempo a la búsqueda
  await page.locator('input[name="id_paciente"]').click();
  await page.locator('input[name="id_paciente"]').fill('Mario Bernardo Beauregard Tellez');

  // Esperar a que aparezca al menos un resultado en la lista
  await expect(page.locator('.paciente-search-item').first()).toBeVisible({ timeout: 15000 });
  await page.locator('.paciente-search-item').first().click();

  // ---- 4. RESTO DE CAMPOS ----
  await page.locator('input[name="hora_cita"]').fill('10:30');
  await page.locator('input[name="motivo"]').fill('Cita de prueba QA');

  // ---- 5. GUARDAR ----
  await page.getByRole('button', { name: 'Guardar cita' }).click();

  // ---- VERIFICAR ÉXITO ----
  await expect(page.getByText('¡Cita registrada!')).toBeVisible({ timeout: 10000 });
});