/**
 * stats.js
 * --------
 * Estadísticas básicas guardadas en el navegador (localStorage):
 * cuántas veces se agregó cada producto al carrito y cuántos pedidos
 * se enviaron por WhatsApp. El panel admin las muestra en su pestaña
 * "Estadísticas".
 */

const CLAVE_STATS = 'tienda_estadisticas';

function leer() {
  try {
    return (
      JSON.parse(localStorage.getItem(CLAVE_STATS) || 'null') || {
        agregados: {}, // { [idProducto]: veces }
        pedidosEnviados: 0,
        totalVendidoEstimado: 0,
      }
    );
  } catch {
    return { agregados: {}, pedidosEnviados: 0, totalVendidoEstimado: 0 };
  }
}

function guardar(stats) {
  localStorage.setItem(CLAVE_STATS, JSON.stringify(stats));
}

/** Registra que un producto se agregó al carrito. */
export function registrarAgregado(idProducto, cantidad = 1) {
  const stats = leer();
  stats.agregados[idProducto] = (stats.agregados[idProducto] || 0) + cantidad;
  guardar(stats);
}

/** Registra un pedido enviado por WhatsApp y su monto. */
export function registrarPedido(total) {
  const stats = leer();
  stats.pedidosEnviados += 1;
  stats.totalVendidoEstimado += total;
  guardar(stats);
}

/** Devuelve las estadísticas acumuladas. */
export function obtenerEstadisticas() {
  return leer();
}

/** Reinicia las estadísticas (botón en el panel admin). */
export function reiniciarEstadisticas() {
  guardar({ agregados: {}, pedidosEnviados: 0, totalVendidoEstimado: 0 });
}
