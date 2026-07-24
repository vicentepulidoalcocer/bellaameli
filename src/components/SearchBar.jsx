/**
 * SearchBar.jsx
 * -------------
 * Buscador en vivo: notifica cada tecla al componente padre, que se
 * encarga de filtrar. Componente controlado y memoizado.
 */

import { memo } from 'react';
import { IconoBuscar, IconoCerrar } from './Icons.jsx';

function SearchBar({ valor, onCambiar, className = '' }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Buscar productos</span>

      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-malva-400">
        <IconoBuscar />
      </span>

      <input
        type="search"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder="Busca por nombre o marca… ej. kaiak"
        autoComplete="off"
        className="w-full rounded-full border border-malva-200 bg-white py-2.5 pl-11 pr-10 text-sm
          shadow-tarjeta placeholder:text-malva-400 focus:border-rosa-400
          dark:border-malva-700 dark:bg-malva-900 dark:placeholder:text-malva-500"
      />

      {/* Botón para limpiar la búsqueda (solo aparece si hay texto) */}
      {valor && (
        <button
          type="button"
          onClick={() => onCambiar('')}
          aria-label="Limpiar búsqueda"
          className="absolute inset-y-0 right-3 flex items-center text-malva-400 transition hover:text-rosa-600"
        >
          <IconoCerrar className="h-4 w-4" />
        </button>
      )}
    </label>
  );
}

export default memo(SearchBar);
