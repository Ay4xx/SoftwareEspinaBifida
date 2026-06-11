import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-30 Eliminar cita creada', async ({ page }) => {
  qase.id(30);
  await page.setViewportSize({ width: 1920, height: 1080 });

  page.on('dialog', (dialog) => dialog.accept());

  // Motivo único para identificar ESTA cita
  const motivo = `Cita QA ${Date.now()}`;

  // ---- LOGIN (coordinador) ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- ENTRAR AL MÓDULO DE AGENDA ----
  await page.getByRole('link', { name: 'Agenda' }).click();
  await expect(page).toHaveURL(/.*agendacitas/);

  // ---- CREAR UNA CITA CON MOTIVO ÚNICO ----
  await page.getByRole('button', { name: /agregar cita/i }).click();
  await page.locator('input[name="id_paciente"]').fill('Luis');
  await expect(page.locator('.paciente-search-item').first()).toBeVisible();
  await page.locator('.paciente-search-item').first().click();
  await page.locator('input[name="hora_cita"]').fill('11:00');
  await page.locator('input[name="motivo"]').fill(motivo);
  await page.getByRole('button', { name: 'Guardar cita' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();

  // ---- ESPERAR A QUE LA CITA NUEVA APAREZCA ----
  const tarjetaCita = page.locator('.appointment-card', { hasText: motivo });
  await expect(tarjetaCita).toBeVisible({ timeout: 10000 });

  // ---- BORRAR ESA CITA ESPECÍFICA (su botón de basura) ----
  await tarjetaCita.locator('.delete-btn').click();

  // ---- VERIFICAR QUE ESA CITA YA NO EXISTE ----
  await expect(tarjetaCita).not.toBeVisible({ timeout: 10000 });
});