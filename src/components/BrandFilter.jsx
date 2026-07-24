/**
 * BrandFilter.jsx
 * ---------------
 * Barra de filtros del catálogo:
 * - Chips por marca: Todos / NICE / Farmasi / Natura
 * - Rango de precio (<$200, $200–$500, >$500)
 * - Conmutadores: Disponibles, Ofertas, Nuevos
 * - Selector de orden: precio, nombre, más recientes
 *
 * Es un componente controlado: recibe el estado de filtros y avisa
 * los cambios; la lógica de filtrado vive en services/products.js.
 */

import { memo } from 'react';
import { MARCAS, RANGOS_PRECIO } from '../services/products.js';

const OPCIONES_ORDEN = [
  { id: 'recientes', etiqueta: 'Más recientes' },
  { id: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { id: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { id: 'nombre', etiqueta: 'Nombre (A–Z)' },
];

/** Chip reutilizable de filtro con estado activo/inactivo. */
function Chip({ activo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition
        ${
          activo
            ? 'bg-rosa-600 text-white shadow-suave'
            : 'bg-white text-malva-700 shadow-tarjeta hover:bg-rosa-50 dark:bg-malva-900 dark:text-malva-200 dark:hover:bg-malva-800'
        }`}
    >
      {children}
    </button>
  );
}

function BrandFilter({ filtros, onCambiarFiltros, orden, onCambiarOrden }) {
  /** Actualiza una sola propiedad del objeto de filtros. */
  const cambiar = (parcial) => onCambiarFiltros({ ...filtros, ...parcial });

  return (
    <div className="space-y-3">
      {/* Fila 1: marcas + orden */}
      <div className="flex flex-wrap items-center gap-2">
        {['Todos', ...MARCAS].map((marca) => (
          <Chip
            key={marca}
            activo={filtros.marca === marca}
            onClick={() => cambiar({ marca })}
          >
            {marca}
          </Chip>
        ))}

        <label className="ml-auto flex items-center gap-2 text-sm text-malva-600 dark:text-malva-300">
          <span className="hidden sm:inline">Ordenar por</span>
          <select
            value={orden}
            onChange={(e) => onCambiarOrden(e.target.value)}
            className="rounded-full border border-malva-200 bg-white px-3 py-1.5 text-sm
              dark:border-malva-700 dark:bg-malva-900"
          >
            {OPCIONES_ORDEN.map((o) => (
              <option key={o.id} value={o.id}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Fila 2: precio y conmutadores */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filtros.precio}
          onChange={(e) => cambiar({ precio: e.target.value })}
          aria-label="Filtrar por precio"
          className="rounded-full border border-malva-200 bg-white px-3 py-1.5 text-sm
            dark:border-malva-700 dark:bg-malva-900"
        >
          {RANGOS_PRECIO.map((r) => (
            <option key={r.id} value={r.id}>
              {r.etiqueta}
            </option>
          ))}
        </select>

        <Chip
          activo={filtros.disponibles}
          onClick={() => cambiar({ disponibles: !filtros.disponibles })}
        >
          Disponibles
        </Chip>
        <Chip activo={filtros.ofertas} onClick={() => cambiar({ ofertas: !filtros.ofertas })}>
          Ofertas
        </Chip>
        <Chip activo={filtros.nuevos} onClick={() => cambiar({ nuevos: !filtros.nuevos })}>
          Nuevos
        </Chip>
      </div>
    </div>
  );
}

export default memo(BrandFilter);
