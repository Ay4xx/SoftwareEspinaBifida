export function calcularTotal(visita) {
  const suma = (arr) =>
    arr.reduce((acc, item) => acc + item.precio, 0);

  return (
    suma(visita.servicios) +
    suma(visita.medicamentos) +
    suma(visita.equipo)
  );
}