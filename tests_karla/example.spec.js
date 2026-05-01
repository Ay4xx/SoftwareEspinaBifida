// @ts-check
import { test, expect } from '@playwright/test';

test('Test1: Agregar una consulta médica con datos correctos', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).click();
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).fill('CORDI@');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).fill('CORDI@tec.mx');
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');
  await page.getByRole('button', { name: '↪ Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Agregar' }).nth(3).click();
  await page.locator('input[name="fecha"]').fill('2026-05-02');
  await page.locator('select[name="hora"]').selectOption('09:00');
  await page.locator('select[name="medico_id"]').selectOption('5');
  await page.getByRole('button', { name: 'Registrar Consulta' }).click();
  await page.getByText('Consulta registradaLa').click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
});

test('Test2: Intentar registrar una consulta sin completar los datos', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).click();
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).fill('CORDI@');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).fill('CORDI@tec.mx');
  await page.getByRole('textbox', { name: 'maria.garcia@email.com' }).press('Tab');
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');
  await page.getByRole('button', { name: '↪ Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Agregar' }).nth(3).click();
  await page.getByRole('button', { name: 'Registrar Consulta' }).click();
  await page.getByText('Datos incompletosDebes').click();
  await page.getByRole('button', { name: 'Entendido' }).click();
});