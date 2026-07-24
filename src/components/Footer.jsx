/**
 * Footer.jsx
 * ----------
 * Pie de página: marcas que se venden, forma de contacto por WhatsApp
 * y una nota sobre cómo se realizan los pedidos.
 */

import { memo } from 'react';
import { MARCAS } from '../services/products.js';
import { IconoWhatsApp, LogoFlor } from './Icons.jsx';

function Footer({ nombreTienda, whatsapp }) {
  const anio = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-malva-100 bg-white dark:border-malva-800 dark:bg-malva-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        {/* Identidad */}
        <div>
          <div className="flex items-center gap-2 text-rosa-600 dark:text-rosa-400">
            <LogoFlor className="h-8 w-8" />
            <span className="font-display text-lg font-semibold text-malva-950 dark:text-white">
              {nombreTienda}
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-malva-500 dark:text-malva-400">
            Productos originales de tus marcas favoritas, con entrega local y atención
            personalizada.
          </p>
        </div>

        {/* Marcas */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-malva-500">
            Nuestras marcas
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {MARCAS.map((marca) => (
              <li key={marca} className="text-malva-700 dark:text-malva-300">
                {marca}
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-malva-500">
            Pedidos y dudas
          </h3>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 px-4 py-2
              text-sm font-semibold text-[#128C4A] transition hover:bg-[#25D366]/20 dark:text-[#4ade80]"
          >
            <IconoWhatsApp />
            Escríbenos por WhatsApp
          </a>
          <p className="mt-3 text-xs leading-relaxed text-malva-400">
            Los pedidos se confirman y pagan directamente por WhatsApp. No se realizan cobros en
            este sitio.
          </p>
        </div>
      </div>

      <div className="border-t border-malva-100 py-4 text-center text-xs text-malva-400 dark:border-malva-800">
        © {anio} {nombreTienda}. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default memo(Footer);
