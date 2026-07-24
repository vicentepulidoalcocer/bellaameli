/**
 * Banner.jsx
 * ----------
 * Banner principal de la portada. El texto, el botón y la imagen se
 * configuran desde src/config/config.js o desde el panel admin.
 * Si la imagen no existe, el degradado de fondo mantiene el diseño.
 */

import { memo, useState } from 'react';

function Banner({ banner }) {
  const [imagenFallo, setImagenFallo] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rosa-100 via-[#fdeef3] to-malva-100
          shadow-suave dark:from-rosa-950 dark:via-malva-900 dark:to-malva-950"
      >
        {/* Imagen decorativa opcional a la derecha */}
        {banner.imagen && !imagenFallo && (
          <img
            src={banner.imagen}
            alt=""
            loading="eager"
            onError={() => setImagenFallo(true)}
            className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover
              [mask-image:linear-gradient(to_right,transparent,black_35%)] sm:block"
          />
        )}

        {/* Pétalos decorativos de fondo */}
        <svg
          viewBox="0 0 200 200"
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 text-rosa-300/40 dark:text-rosa-800/30"
        >
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse
              key={a}
              cx="100"
              cy="55"
              rx="24"
              ry="45"
              fill="currentColor"
              transform={`rotate(${a} 100 100)`}
            />
          ))}
        </svg>

        <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-rosa-700 dark:text-rosa-300">
            Catálogo en línea
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-malva-950 dark:text-white sm:text-4xl lg:text-5xl">
            {banner.titulo}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-malva-700 dark:text-malva-300 sm:text-base">
            {banner.subtitulo}
          </p>
          <a href="#catalogo" className="boton-primario mt-7">
            {banner.textoBoton}
          </a>
        </div>
      </div>
    </section>
  );
}

export default memo(Banner);
