import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-36 Inventario - Crear Re-Stock', async ({ page }) => {
  qase.id(36);
  await page.setViewportSize({ width: 1920, height: 1080 });

  // ---- LOGIN ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- 2. IR A INVENTARIO ----
  await page.getByRole('link', { name: 'Inventario' }).click();

  // ---- 3. CLICK EN "Registrar Entrada" ----
  await page.getByRole('button', { name: /registrar entrada/i }).click();

  // Esperar a que abra el modal
  await expect(page.getByRole('heading', { name: 'Registrar Entrada' })).toBeVisible();

  // ---- 4. ESCOGER CATEGORÍA (Medicina) ----
  // Primer select del modal = Categoría
  const selectCategoria = page.locator('.re-popup select').first();
  await selectCategoria.selectOption('medicina');

  // ---- 5. ESCOGER ARTÍCULO (aparece tras elegir categoría) ----
  // Al elegir categoría aparece un segundo select = Artículo
  const selectArticulo = page.locator('.re-popup select').nth(1);
  await expect(selectArticulo).toBeVisible();
  // Elegir el primer artículo real (index 1, porque index 0 es "Seleccionar")
  await selectArticulo.selectOption({ index: 1 });

  // ---- 6. INGRESAR CANTIDAD (aparece tras elegir artículo) ----
  const inputCantidad = page.locator('.re-popup input[type="number"]');
  await expect(inputCantidad).toBeVisible();
  await inputCantidad.fill('5');

  // ---- 7. PULSAR "Guardar" ----
  await page.getByRole('button', { name: 'Guardar' }).click();

  // ---- VERIFICAR INFORMACIÓN ACTUALIZADA (popup de éxito) ----
  await expect(page.getByRole('heading', { name: 'Entrada registrada' })).toBeVisible();
});