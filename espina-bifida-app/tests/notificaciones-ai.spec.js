// Prompt usado: "Genera un test de Playwright para aprobar una notificación pendiente
// tras iniciar sesión con cordi@tec.mx y contraseña 1234. El flujo navega a
// /notificaciones, hace clic en la primera tarjeta pendiente, avanza 4 pasos
// del asistente y presiona .btn-aprobar-revision. Verifica modal de éxito con 'aprobado'."

import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

// Función auxiliar sugerida por Copilot para reutilizar el inicio de sesión
async function iniciarSesionCoordinador(page) {
  await page.goto('http://localhost:3000');
  await page.fill('input[type="email"]', 'cordi@tec.mx');
  await page.fill('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/usuarios');
}

test.describe('Flujo de Notificaciones', () => {

  test('HS01-11 - Aprobar notificación pendiente', async ({ page }) => {
    qase.id(11);

    await iniciarSesionCoordinador(page);
    await page.goto('http://localhost:3000/notificaciones');

    // Copilot sugirió usar Promise.all para sincronizar la navegación con el clic
    const tarjetaNoti = page.locator('.noti-card').first();
    await expect(tarjetaNoti).toBeVisible();
    await expect(page.locator('.estado-badge.pendiente').first()).toBeVisible();

    await Promise.all([
      page.waitForURL('**/registro'),
      tarjetaNoti.click(),
    ]);

    // Ciclo para avanzar los pasos del asistente — aceptado sin modificaciones
    for (let i = 0; i < 4; i++) {
      await page.locator('.btn-siguiente').click();
      await page.waitForTimeout(500);
    }

    await page.locator('.btn-aprobar-revision').click();

    // Copilot sugirió encadenar los expect para mayor legibilidad
    const exito = page.locator('.registro-exito');
    await expect(exito).toBeVisible({ timeout: 10000 });
    await expect(exito.locator('h2')).toContainText('aprobado');
    await page.waitForURL('**/notificaciones');
  });

  test('HS01-12 - Búsqueda de notificación inexistente', async ({ page }) => {
    qase.id(12);

    await iniciarSesionCoordinador(page);
    await page.goto('http://localhost:3000/notificaciones');

    // Copilot sugirió getByPlaceholder — se rechazó porque la app usa clase CSS
    // await page.getByPlaceholder('Buscar...').fill(...) ← RECHAZADO
    await page.fill('.noti-search input', 'XXXX000000XXXXXX00');

    // Se verifican visibilidad y texto del mensaje de lista vacía
    const sinNoti = page.locator('.sin-notificaciones').first();
    await expect(sinNoti).toBeVisible();
    await expect(sinNoti).toContainText('No hay notificaciones');
  });

});