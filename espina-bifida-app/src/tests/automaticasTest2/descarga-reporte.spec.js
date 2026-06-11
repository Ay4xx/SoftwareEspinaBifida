import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-22 Descarga de reporte', async ({ page }) => {
  qase.id(22);
  await page.setViewportSize({ width: 1920, height: 1080 });

  // ---- LOGIN (admin) ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('admin@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- IR A ESTADÍSTICAS ----
  await page.getByRole('link', { name: 'Estadísticas' }).click();
  await expect(page).toHaveURL(/.*estadisticas/);

  // ---- ESPERAR A QUE LA PÁGINA CARGUE COMPLETAMENTE ----
  // Espera a que el botón exista y sea visible antes de hacer click
  const btnDescargar = page.getByRole('button', { name: /descargar reporte/i }).first();
  await expect(btnDescargar).toBeVisible({ timeout: 15000 });

  // ---- ABRIR EL MODAL DE DESCARGA ----
  await btnDescargar.click();

  // Esperar a que el modal abra
  await expect(page.getByText('Excel (.xlsx)')).toBeVisible({ timeout: 5000 });

  // ---- SELECCIONAR FORMATO EXCEL ----
  await page.getByText('Excel (.xlsx)').click();

  // ---- ESCUCHAR DESCARGA Y CLICKEAR ----
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /descargar reporte/i }).last().click();

  // ---- VERIFICAR QUE EL ARCHIVO SE DESCARGÓ ----
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('reporte_mensual');
});