// @ts-check
import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).fill('cordi@tec.mx');
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page.getByText('Módulo de Usuarios')).toBeVisible({ timeout: 10000 });
}

async function abrirModalCita(page) {
  await page.getByRole('link', { name: /agenda/i }).click();
  await expect(page).toHaveURL(/\/agendacitas/, { timeout: 5000 });
  await page.getByRole('button', { name: /agregar paciente/i }).click();
  await expect(page.getByRole('heading', { name: 'Nueva cita' })).toBeVisible({ timeout: 5000 });
}

test.describe('Flujo de Agenda de Citas', () => {

  test('[HS01-14] Agendar una cita médica con datos correctos', async ({ page }) => {
    await login(page);
    await abrirModalCita(page);

    await page.locator('input[name="id_paciente"]').fill('1');
    await page.locator('input[name="hora_cita"]').fill('09:00');
    await page.locator('input[name="motivo"]').fill('Consulta general');
    await page.locator('textarea[name="notas"]').fill('Prueba automatizada');

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Cita creada');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Guardar cita' }).click();
  });

  test('[HS01-13] Intentar agendar una cita sin completar los datos', async ({ page }) => {
    await login(page);
    await abrirModalCita(page);

    await page.getByRole('button', { name: 'Guardar cita' }).click();
    await expect(page.getByRole('heading', { name: 'Nueva cita' })).toBeVisible({ timeout: 3000 });
  });

});