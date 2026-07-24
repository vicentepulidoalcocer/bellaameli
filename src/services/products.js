/**
 * products.js (servicio)
 * ----------------------
 * Toda la lógica de datos del catálogo vive aquí, separada de la UI:
 * carga, búsqueda, filtros, ordenamiento y productos relacionados.
 *
 * Fuente de datos:
 *  1) src/data/products.json (generado desde el Excel por scripts/excel-to-json.js)
 *  2) Si el panel admin subió un Excel desde el navegador, ese catálogo
 *     (localStorage) tiene prioridad.
 *  3) El panel admin también puede guardar "ajustes" por producto
 *     (activar/desactivar, oferta, nuevo) que se aplican encima.
 */

export const CLAVE_CATALOGO_ADMIN = 'tienda_catalogo_admin';
export const CLAVE_AJUSTES_ADMIN = 'tienda_ajustes_admin';

export const MARCAS = ['NICE', 'Farmasi', 'Natura'];

export const RANGOS_PRECIO = [
  { id: 'todos', etiqueta: 'Cualquier precio', prueba: () => true },
  { id: 'menos200', etiqueta: 'Menos de $200', prueba: (p) => p.precio < 200 },
  { id: '200a500', etiqueta: '$200 – $500', prueba: (p) => p.precio >= 200 && p.precio <= 500 },
  { id: 'mas500', etiqueta: 'Más de $500', prueba: (p) => p.precio > 500 },
];

/** Lee el catálogo cargado por el admin desde el navegador (si existe). */
function leerCatalogoAdmin() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_CATALOGO_ADMIN) || 'null');
    return Array.isArray(datos) && datos.length ? datos : null;
  } catch {
    return null;
  }
}

/** Lee los ajustes por producto guardados por el admin: { [id]: {activo, oferta, nuevo} } */
export function leerAjustesAdmin() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_AJUSTES_ADMIN) || '{}') || {};
  } catch {
    return {};
  }
}

/** Aplica los ajustes del admin encima del producto base. */
function aplicarAjustes(producto, ajustes) {
  const ajuste = ajustes[producto.id];
  return ajuste ? { ...producto, ...ajuste } : producto;
}

/**
 * Carga el catálogo completo (activos e inactivos).
 * Usa import dinámico para que el JSON se cargue de forma diferida.
 * @returns {Promise<Array>} lista de productos
 */
export async function cargarCatalogoCompleto() {
  const ajustes = leerAjustesAdmin();
  const admin = leerCatalogoAdmin();
  if (admin) return admin.map((p) => aplicarAjustes(p, ajustes));

  const modulo = await import('../data/products.json');
  return modulo.default.map((p) => aplicarAjustes(p, ajustes));
}

/** Carga solo los productos visibles en la tienda (activos). */
export async function cargarProductos() {
  const todos = await cargarCatalogoCompleto();
  return todos.filter((p) => p.activo);
}

/** Normaliza texto para búsquedas: minúsculas y sin acentos. */
function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Búsqueda en vivo por coincidencias parciales.
 * "kai" encuentra "Kaiak", "Kaiak Aventura", etc.
 */
export function buscarProductos(productos, termino) {
  const t = normalizar(termino).trim();
  if (!t) return productos;
  return productos.filter((p) => {
    const pajar = normalizar(`${p.nombre} ${p.marca} ${p.categoria} ${p.descripcion}`);
    return pajar.includes(t);
  });
}

/**
 * Aplica los filtros seleccionados.
 * @param {Array} productos
 * @param {{marca:string, precio:string, disponibles:boolean, ofertas:boolean, nuevos:boolean}} filtros
 */
export function filtrarProductos(productos, filtros) {
  const rango = RANGOS_PRECIO.find((r) => r.id === filtros.precio) || RANGOS_PRECIO[0];
  return productos.filter((p) => {
    if (filtros.marca !== 'Todos' && p.marca !== filtros.marca) return false;
    if (!rango.prueba(p)) return false;
    if (filtros.disponibles && p.stock <= 0) return false;
    if (filtros.ofertas && !p.oferta) return false;
    if (filtros.nuevos && !p.nuevo) return false;
    return true;
  });
}

/** Ordena una copia de la lista según el criterio elegido. */
export function ordenarProductos(productos, criterio) {
  const copia = [...productos];
  switch (criterio) {
    case 'precio-asc':
      return copia.sort((a, b) => a.precio - b.precio);
    case 'precio-desc':
      return copia.sort((a, b) => b.precio - a.precio);
    case 'nombre':
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    case 'recientes':
      // "Más recientes": primero los marcados como nuevos, luego por ID descendente
      return copia.sort((a, b) => Number(b.nuevo) - Number(a.nuevo) || b.id - a.id);
    default:
      return copia;
  }
}

/**
 * Productos relacionados: misma marca o misma categoría, excluyendo el actual.
 * @returns {Array} hasta `limite` productos
 */
export function productosRelacionados(productos, producto, limite = 4) {
  return productos
    .filter((p) => p.id !== producto.id)
    .map((p) => ({
      p,
      puntaje:
        (p.categoria === producto.categoria ? 2 : 0) + (p.marca === producto.marca ? 1 : 0),
    }))
    .filter(({ puntaje }) => puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, limite)
    .map(({ p }) => p);
}
