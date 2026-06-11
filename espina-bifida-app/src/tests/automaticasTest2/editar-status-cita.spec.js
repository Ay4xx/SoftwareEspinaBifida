import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-28 Editar status de la cita', async ({ page }) => {
  qase.id(28);
  await page.setViewportSize({ width: 1920, height: 1080 });

  // ---- LOGIN (coordinador) ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- ENTRAR A AGENDA ----
  await page.getByRole('link', { name: 'Agenda' }).click();
  await expect(page).toHaveURL(/.*agendacitas/);

  // ---- CREAR UNA CITA (pre-condición) ----
  await page.getByRole('button', { name: /agregar cita/i }).click();

  await page.locator('input[name="id_paciente"]').click();
  await page.locator('input[name="id_paciente"]').pressSequentially('Mario Bernardo Beauregard Tellez', { delay: 50 });
  await expect(page.locator('.paciente-search-item').first()).toBeVisible({ timeout: 15000 });
  await page.locator('.paciente-search-item').first().click();

  await page.locator('input[name="hora_cita"]').fill('10:30');
  await page.locator('input[name="motivo"]').fill('Cita pre-condición QA');
  await page.getByRole('button', { name: 'Guardar cita' }).click();
  await expect(page.getByText('¡Cita registrada!')).toBeVisible({ timeout: 10000 });

  // ---- CERRAR EL POPUP ----
  const btnCerrarPopup = page.locator('.med-overlay').getByRole('button', { name: /cerrar|×|✕|close/i });
  if (await btnCerrarPopup.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btnCerrarPopup.click();
  } else {
    await page.mouse.click(10, 10);
  }

  // Esperar a que el overlay desaparezca completamente
  await expect(page.locator('.med-overlay')).not.toBeAttached({ timeout: 10000 });

  // ---- ESPERAR QUE CARGUEN LAS CITAS ----
  const selectEstado = page.locator('.appointment-card select').first();
  await expect(selectEstado).toBeVisible({ timeout: 15000 });

  // ---- CAMBIAR ESTATUS ----
  // Interceptar el PUT y el GET que recarga las citas
  const putEstatus = page.waitForResponse(
    res => res.url().includes('/api/citas') && res.url().includes('/estatus') && res.request().method() === 'PUT',
    { timeout: 10000 }
  );

  const getCitas = page.waitForResponse(
    res => res.url().includes('/api/citas') && res.request().method() === 'GET',
    { timeout: 10000 }
  );

  await selectEstado.selectOption('CONFIRMADA');

  // Esperar que el PUT y el GET de recarga terminen
  await putEstatus;
  await getCitas;

  // Verificar que el select tiene el valor actualizado de la BD
  await expect(selectEstado).toHaveValue('CONFIRMADA', { timeout: 10000 });
});