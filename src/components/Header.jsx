/**
 * Header.jsx
 * ----------
 * Cabecera fija: logo + nombre de la tienda, buscador (en escritorio),
 * conmutador de tema claro/oscuro y botón del carrito con contador.
 * En móvil el buscador baja a una segunda fila para no comprimirse.
 */

import { memo } from 'react';
import { useCart } from '../hooks/useCart.js';
import { useTheme } from '../hooks/useTheme.js';
import SearchBar from './SearchBar.jsx';
import { IconoBolsa, IconoLuna, IconoSol, LogoFlor } from './Icons.jsx';

function Header({ nombreTienda, eslogan, busqueda, onBuscar }) {
  const { cantidadArticulos, abrirCarrito } = useCart();
  const { tema, alternarTema } = useTheme();

  return (
    <header
      className="sticky top-0 z-40 border-b border-malva-100 bg-white/85 backdrop-blur
        dark:border-malva-800 dark:bg-malva-950/85"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-3">
          {/* Logo y nombre */}
          <a href="#" className="flex min-w-0 items-center gap-2.5" aria-label="Inicio">
            <span className="text-rosa-600 dark:text-rosa-400">
              <LogoFlor />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-semibold leading-tight">
                {nombreTienda}
              </span>
              <span className="block truncate text-[11px] uppercase tracking-[0.18em] text-malva-500 dark:text-malva-400">
                {eslogan}
              </span>
            </span>
          </a>

          {/* Buscador en escritorio */}
          <div className="hidden flex-1 justify-center px-6 md:flex">
            <SearchBar valor={busqueda} onCambiar={onBuscar} className="w-full max-w-lg" />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Tema claro/oscuro */}
            <button
              type="button"
              onClick={alternarTema}
              aria-label={tema === 'claro' ? 'Activar modo oscuro' : 'Activar modo claro'}
              className="rounded-full p-2.5 text-malva-600 transition hover:bg-malva-100
                dark:text-malva-300 dark:hover:bg-malva-800"
            >
              {tema === 'claro' ? <IconoLuna /> : <IconoSol />}
            </button>

            {/* Carrito con contador */}
            <button
              type="button"
              onClick={abrirCarrito}
              aria-label={`Abrir carrito (${cantidadArticulos} artículos)`}
              className="relative rounded-full bg-rosa-600 p-2.5 text-white shadow-suave transition
                hover:bg-rosa-700 active:scale-95"
            >
              <IconoBolsa />
              {cantidadArticulos > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center
                    rounded-full bg-malva-900 px-1 text-[11px] font-bold text-white dark:bg-white dark:text-malva-900"
                >
                  {cantidadArticulos}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador en móvil (segunda fila) */}
        <div className="pb-3 md:hidden">
          <SearchBar valor={busqueda} onCambiar={onBuscar} />
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
