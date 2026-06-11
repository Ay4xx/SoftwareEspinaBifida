import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { login } from './helpers';

test('HS01-2 Render de las cartas de pacientes', async ({ page }) => {
  qase.id(2);

  await login(page);

  await expect(page.getByRole('heading', { name: 'Módulo de Pacientes' })).toBeVisible();

  // Hay al menos una tarjeta con botón "Detalle"
  const botonesDetalle = page.getByRole('button', { name: /detalle/i });
  await expect(botonesDetalle.first()).toBeVisible();

  // Verificar que hay varias tarjetas (tu captura muestra 6)
  const cantidad = await botonesDetalle.count();
  expect(cantidad).toBeGreaterThan(0);
});