import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import path from 'path';

test(qase(18, 'Registro'), async ({ page }) => {

  await test.step(qase.step('Ingresar al sistema como invitado', 'La pagina de registro debe cargarse', undefined), async () => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: 'Ingresar como invitado' }).click();

    await expect(page.getByRole('heading', { name: 'Datos del Paciente' })).toBeVisible();
    await expect(page.getByText('Paso 1 de')).toBeVisible();
  });

  await test.step(qase.step('Completar datos personales del paciente', 'Los datos personales deben completarse correctamente', undefined), async () => {
    await page.getByRole('textbox', { name: 'Ej. María Elena' }).fill('John ');
    await page.getByRole('textbox', { name: 'Ej. González' }).fill('Doe');

    await page.getByRole('button', { name: '♂ Masculino' }).click();

    await page.locator('input[name="fechaNacimiento"]').fill('2026-04-01');

    await page.getByRole('textbox', { name: 'Ej. GOML901012MNLLRR09' }).fill('GOML901012MNLLRR09');
    await expect(page.getByText('CURP con formato válido.')).toBeVisible();
  });

  await test.step(qase.step('Avanzar al paso 2', 'El paso 2 debe cargarse', undefined), async () => {
    await page.getByRole('button').filter({ hasText: /^$/ }).click();
    await expect(page.getByText('Paso 2 de')).toBeVisible();
  });

  await test.step(qase.step('Completar domicilio y datos de contacto', 'Los datos de contacto deben completarse correctamente', undefined), async () => {
    await page.getByRole('textbox', { name: 'Calle y número' }).fill('Ave. Tec de monterrey');
    await page.getByRole('textbox', { name: 'Ej. 64000' }).fill('64000');

    await page.getByRole('combobox').selectOption('Estado de México');

    await page.getByRole('textbox', { name: 'Ej. Monterrey' }).fill('Monterrey');

    await page.locator('input[name="telefonoCasa"]').fill('8115511551');
    await page.locator('input[name="telefonoCelular"]').fill('8115511551');

    await page.getByRole('textbox', { name: 'ejemplo@correo.com' }).fill('tec@gmail.com');

    await page.getByRole('textbox', { name: 'Nombre completo' }).fill('Maria');
    await page.locator('input[name="emergenciaTelefono"]').fill('8115511551');
  });

  await test.step(qase.step('Avanzar al paso 3', 'El paso 3 debe cargarse', undefined), async () => {
    await page.getByRole('button').nth(1).click();
    await expect(page.getByText('Paso 3 de')).toBeVisible();
  });

  await test.step(qase.step('Completar datos médicos y de nacimiento', 'Los datos médicos y de nacimiento deben completarse correctamente', undefined), async () => {
    await page.getByRole('textbox', { name: 'Ciudad y estado donde nació' }).fill('Monterrey Nuevo Leon');
    await page.getByRole('textbox', { name: 'Nombre del hospital' }).fill('IMSS');

    await page.getByRole('button', { name: 'O+' }).click();
    await page.getByRole('button', { name: 'No' }).click();
    await page.getByRole('button', { name: 'MÉDULA ANCLADA' }).click();
  });

  await test.step(qase.step('Avanzar al paso 4', 'El paso 4 debe cargarse', undefined), async () => {
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();
    await expect(page.getByText('Paso 4 de')).toBeVisible();
  });

  await test.step(qase.step('Completar datos del tutor o madre/padre', 'Los datos del tutor deben completarse correctamente', undefined), async () => {
    await page.getByRole('textbox', { name: 'Nombre completo' }).fill('Jane Doe');

    await page.getByPlaceholder('Ej. 35').fill('35');

    await page.getByRole('textbox', { name: 'Ciudad, Estado' }).fill('Monterrey Nuevo Leon');

    await page.getByRole('textbox', { name: 'Ej. Enfermera, Contador...' }).fill('Contador');

    await page.getByRole('combobox').selectOption('Preparatoria / Bachillerato');

    await page.locator('input[name="tutorSeguroMedico"]').fill('IMSS');

    await page.getByRole('button', { name: 'Sí' }).first().click();

    await page.getByPlaceholder('Ej. 8').fill('3');

    await page.locator('input[name="madreSeguroMedico"]').fill('IMSS');

    await page.getByRole('button', { name: 'No' }).nth(1).click();
  });

  await test.step(qase.step('Avanzar al paso 5', 'El paso 5 debe cargarse', undefined), async () => {
    await page.getByRole('button').nth(5).click();
    await expect(page.getByText('Paso 5 de')).toBeVisible();
  });

await test.step(
  qase.step(
    'Cargar fotografía del paciente',
    'La fotografía del paciente debe cargarse correctamente',
    undefined
  ),
  async () => {
    const filePath = path.join(__dirname, 'assets', 'idPhotoMan.jpg');

    await page.locator('input[type="file"]').setInputFiles(filePath);
  }
);
  await test.step(qase.step('Finalizar registro', 'El registro debe finalizarse correctamente', undefined), async () => {
    await page.getByRole('button').nth(1).click();
  });

});