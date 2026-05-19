import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';

test(qase(21, 'Registro fail'), async ({ page }) => {
  await test.step(qase.step('1. Navegar a la página de login','Aparece la pagina de login', undefined), async () => {
    await page.goto('http://localhost:3000/login');
  });

  await test.step(qase.step('2. Ingresar como invitado', 'Se muestra el paso 1 del registro', undefined), async () => {
    await page.getByRole('button', { name: 'Ingresar como invitado' }).click();
    await expect(page.getByText('Paso 1 de')).toBeVisible();
  });

  await test.step(qase.step('3. Completar datos personales', 'Los datos personales se completan correctamente', undefined), async () => {
    await page.getByRole('textbox', { name: 'Ej. María Elena' }).click();
    await page.getByRole('textbox', { name: 'Ej. María Elena' }).fill('Maria Elena');
    await page.getByRole('textbox', { name: 'Ej. González' }).click();
    await page.getByRole('textbox', { name: 'Ej. González' }).fill('Gonzales');
    await page.getByRole('button', { name: '♀ Femenino' }).click();
  });

  await test.step(qase.step('4. Ingresar fecha de nacimiento', 'La fecha de nacimiento se ingresa correctamente', undefined), async () => {
    await page.locator('input[name="fechaNacimiento"]').fill('2026-04-03');
  });

  await test.step(qase.step('5. Ingresar CURP inválida y validar error', 'Se muestra el mensaje de error para la CURP inválida', undefined), async () => {
    await page.getByRole('textbox', { name: 'Ej. GOML901012MNLLRR09' }).click();
    await page.getByRole('textbox', { name: 'Ej. GOML901012MNLLRR09' }).fill('GOM3901012MNLLRR09');
    await expect(page.getByText('El formato de la CURP no es v')).toBeVisible();
  });

  await test.step(qase.step('6. Validar mensaje de CURP inválida', 'Se muestra el mensaje de error para la CURP inválida', undefined), async () => {
    await page.getByRole('button').filter({ hasText: /^$/ }).click();
    await expect(page.getByText('La CURP ingresada no tiene un')).toBeVisible();
  });
});