import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-6 Asignación de citas', async ({ page }) => {
  qase.id(6);

  // ---- LOGIN ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- ESCOGER PACIENTE ----
  await page.getByRole('button', { name: /detalle/i }).first().click();

  // ---- IR A TAB "Citas" ----
  await page.getByRole('button', { name: /citas/i }).click();

  // ---- VERIFICAR QUE CARGÓ EL FORMULARIO ----
  await expect(page.getByRole('heading', { name: 'Registrar Consulta' })).toBeVisible();

  // ---- ESPERAR A QUE EL SELECT DE HORA TENGA OPCIONES ----
  await expect(page.locator('select[name="hora"] option')).toHaveCount(
    await page.locator('select[name="hora"] option').count() > 1
      ? await page.locator('select[name="hora"] option').count()
      : 2,
    { timeout: 10000 }
  );
  await page.locator('select[name="hora"]').selectOption({ index: 1 });

  // ---- ESPERAR A QUE EL SELECT DE MÉDICO TENGA OPCIONES REALES ----
  // Espera hasta que haya más de 1 opción (la opción 0 es "Seleccionar")
  await page.waitForFunction(() => {
    const select = document.querySelector('select[name="medico_id"]');
    return select && select.options.length > 1;
  }, { timeout: 15000 });

  await page.locator('select[name="medico_id"]').selectOption({ index: 1 });

  // ---- REGISTRAR ----
  await page.getByRole('button', { name: 'Registrar Consulta' }).click();

  // ---- VERIFICAR ÉXITO ----
  await expect(page.getByRole('heading', { name: 'Consulta registrada' })).toBeVisible({ timeout: 10000 });
});