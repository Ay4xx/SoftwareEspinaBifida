import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HS01-37 Agregar nuevo Artículo', async ({ page }) => {
  qase.id(37);
  await page.setViewportSize({ width: 1920, height: 1080 });

  const nombreArticulo = `Articulo QA ${Date.now()}`;

  // ---- LOGIN ----
  await page.goto('http://localhost:3000/');
  await page.locator('input[type="email"]').fill('cordi@tec.mx');
  await page.locator('input[type="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/.*usuarios/);

  // ---- IR A INVENTARIO ----
  await page.getByRole('link', { name: 'Inventario' }).click();

  // ---- CLICK EN "Nuevo Artículo" ----
  await page.getByRole('button', { name: /nuevo artículo/i }).click();
  await expect(page.getByRole('heading', { name: 'Nuevo Artículo' })).toBeVisible({ timeout: 10000 });

  // ---- LLENAR FORMULARIO ----
  await page.locator('select[name="categoria"]').selectOption('equipo');
  
  // Esperar a que el formulario se actualice según la categoría
  await page.waitForTimeout(500);
  
  await page.locator('input[name="descripcion"]').fill(nombreArticulo);
  await page.locator('input[name="precio"]').fill('150');
  await page.locator('input[name="cantidad_total"]').fill('10');

  // ---- GUARDAR ----
  await page.getByRole('button', { name: 'Guardar' }).click();

  // ---- DIAGNÓSTICO: ver qué aparece después del click ----
  await page.waitForTimeout(2000);
  const headings = await page.getByRole('heading').allTextContents();
  console.log('Headings visibles:', headings);
  const bodyText = await page.locator('body').innerText();
  console.log('Texto en página:', bodyText.substring(0, 500));

  // ---- VERIFICAR ÉXITO ----
  // Intentar varias formas en que puede aparecer el mensaje
  await expect(
    page.getByRole('heading', { name: /artículo guardado/i })
      .or(page.getByText(/artículo guardado/i))
      .or(page.getByText(/guardado exitosamente/i))
      .or(page.getByText(/artículo creado/i))
  ).toBeVisible({ timeout: 10000 });
});