/**
 * formatCurrency.js
 * -----------------
 * Formatea cantidades como moneda mexicana. Centralizado aquí para que,
 * si algún día cambia la moneda o el formato, solo se toque este archivo.
 */

const formateador = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * @param {number} cantidad - Monto a formatear.
 * @returns {string} Ej. 520 -> "$520"
 */
export function formatCurrency(cantidad) {
  if (!Number.isFinite(cantidad)) return '$0';
  return formateador.format(cantidad);
}
