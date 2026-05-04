import { test, expect } from '@playwright/test';

test('Registrar cita médica correctamente y mostrar mensaje de éxito', async ({ page }) => {
  // Navegar a la página de registro de citas
  await page.goto('http://localhost:3000/inventario/68'); // Ajusta la URL según tu aplicación
  
  // Llenar el formulario con información válida
  //await page.fill('input[name="paciente"]', 'Juan Pérez');
  await page.fill('input[name="fecha"]', '2024-12-20');
  await page.locator('select[name="hora"]').selectOption('09:00');
  await page.locator('select[name="medico_id"]').selectOption('5');
  
  // Hacer clic en el botón guardar
  await page.getByRole('button', { name: 'Registrar Consulta' }).click();
  
  // Verificar que aparezca el mensaje de éxito
  const mensajeExito = page.locator('text=Consulta registradaLa');
  await expect(mensajeExito).toBeVisible();
  await expect(mensajeExito).toContainText('Consulta registradaLa');
});

test('Mostrar mensaje de error cuando falta información obligatoria', async ({ page }) => {
  // Navegar a la página de registro de citas
  await page.goto('http://localhost:3000/inventario/68'); // Ajusta la URL según tu aplicación
  
  // Llenar solo algunos campos, dejando campos obligatorios vacíos
  //await page.fill('input[name="paciente"]', 'María González');
  // Dejar el campo de fecha vacío (campo obligatorio)
  // Dejar el campo de hora vacío (campo obligatorio)
  
  // Hacer clic en el botón guardar sin completar la información obligatoria
  await page.getByRole('button', { name: 'Registrar Consulta' }).click();
  
  // Verificar que aparezca un mensaje de error
  const mensajeError = page.locator('text=Datos incompletosDebes');
  await expect(mensajeError).toBeVisible();
  await expect(mensajeError).toContainText('incompletos');
});
