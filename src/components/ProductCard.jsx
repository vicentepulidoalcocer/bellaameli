/**
 * ProductCard.jsx
 * ---------------
 * Tarjeta de producto con:
 * - Imagen con carga diferida (lazy) y respaldo si falta el archivo
 * - Etiquetas: Nuevo / Oferta / Agotado / Últimas piezas
 * - Precio actual y precio anterior tachado
 * - Selector de cantidad + botón Agregar
 * - Botones de favorito y compartir
 *
 * Memoizada con React.memo: solo se vuelve a renderizar la tarjeta
 * cuyo estado (favorito, etc.) realmente cambió.
 */

import { memo, useState } from 'react';
import { useCart } from '../hooks/useCart.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import {
  IconoBolsa,
  IconoCompartir,
  IconoCorazon,
  IconoMas,
  IconoMenos,
} from './Icons.jsx';

const UMBRAL_ULTIMAS_PIEZAS = 3;

/** Etiqueta de estado sobre la imagen. */
function Etiqueta({ tipo }) {
  const estilos = {
    nuevo: 'bg-malva-800 text-white',
    oferta: 'bg-rosa-600 text-white',
    agotado: 'bg-malva-400 text-white',
    ultimas: 'bg-amber-500 text-white',
  };
  const textos = {
    nuevo: 'Nuevo',
    oferta: 'Oferta',
    agotado: 'Agotado',
    ultimas: 'Últimas piezas',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${estilos[tipo]}`}>
      {textos[tipo]}
    </span>
  );
}

function ProductCard({ producto, esFavorito, onAlternarFavorito, onVerDetalle }) {
  const { agregarAlCarrito, abrirCarrito } = useCart();
  const { mostrarToast } = useToast();

  const [cantidad, setCantidad] = useState(1);
  const [imagenFallo, setImagenFallo] = useState(false);

  const agotado = producto.stock <= 0;
  const ultimasPiezas = !agotado && producto.stock <= UMBRAL_ULTIMAS_PIEZAS;

  /** Agrega al carrito, muestra toast y abre el panel lateral. */
  const manejarAgregar = () => {
    if (agotado) return;
    agregarAlCarrito(producto, cantidad);
    mostrarToast(`${producto.nombre} agregado al carrito`);
    setCantidad(1);
    abrirCarrito();
  };

  /** Comparte con la API nativa o copia el texto al portapapeles. */
  const manejarCompartir = async () => {
    const texto = `${producto.nombre} (${producto.marca}) — ${formatCurrency(producto.precio)}`;
    const url = window.location.href.split('#')[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: producto.nombre, text: texto, url });
      } else {
        await navigator.clipboard.writeText(`${texto}\n${url}`);
        mostrarToast('Producto copiado para compartir', 'info');
      }
    } catch {
      /* El usuario canceló el diálogo de compartir */
    }
  };

  return (
    <article
      className="group flex animate-aparecer flex-col overflow-hidden rounded-3xl bg-white
        shadow-tarjeta transition hover:-translate-y-0.5 hover:shadow-suave dark:bg-malva-900"
    >
      {/* Imagen (clic = ver detalle y relacionados) */}
      <button
        type="button"
        onClick={() => onVerDetalle(producto)}
        className="relative block aspect-square w-full overflow-hidden bg-malva-100 dark:bg-malva-800"
        aria-label={`Ver detalles de ${producto.nombre}`}
      >
        {imagenFallo ? (
          <span className="flex h-full items-center justify-center px-4 text-center font-display text-lg text-malva-400">
            {producto.nombre}
          </span>
        ) : (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenFallo(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}

        {/* Etiquetas */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {agotado && <Etiqueta tipo="agotado" />}
          {!agotado && producto.oferta && <Etiqueta tipo="oferta" />}
          {!agotado && producto.nuevo && <Etiqueta tipo="nuevo" />}
          {ultimasPiezas && <Etiqueta tipo="ultimas" />}
        </div>

        {/* Favorito */}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onAlternarFavorito(producto.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onAlternarFavorito(producto.id);
            }
          }}
          aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-tarjeta transition
            hover:scale-110 dark:bg-malva-950/80
            ${esFavorito ? 'text-rosa-600' : 'text-malva-500'}`}
        >
          <IconoCorazon relleno={esFavorito} className="h-5 w-5" />
        </span>
      </button>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rosa-600 dark:text-rosa-400">
          {producto.marca}
        </p>
        <h3 className="font-display text-base font-semibold leading-snug">{producto.nombre}</h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatCurrency(producto.precio)}</span>
          {producto.precioAnterior > producto.precio && (
            <span className="text-sm text-malva-400 line-through">
              {formatCurrency(producto.precioAnterior)}
            </span>
          )}
        </div>

        <p className="text-xs text-malva-500 dark:text-malva-400">
          {agotado
            ? 'Sin existencias'
            : ultimasPiezas
              ? `¡Solo quedan ${producto.stock}!`
              : `${producto.stock} disponibles`}
        </p>

        {/* Acciones.
            En móvil (tarjetas angostas a 2 columnas) se apilan en dos filas
            para no comprimirse; desde 'sm' vuelven a una sola fila. */}
        <div className="mt-3 space-y-2 sm:space-y-0">
          {/* Fila superior: cantidad + compartir */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center rounded-full border border-malva-200 dark:border-malva-700"
              aria-label="Cantidad"
            >
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                disabled={agotado || cantidad <= 1}
                aria-label="Disminuir cantidad"
                className="p-2 text-malva-500 transition hover:text-rosa-600 disabled:opacity-40"
              >
                <IconoMenos />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{cantidad}</span>
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                disabled={agotado || cantidad >= producto.stock}
                aria-label="Aumentar cantidad"
                className="p-2 text-malva-500 transition hover:text-rosa-600 disabled:opacity-40"
              >
                <IconoMas />
              </button>
            </div>

            {/* En 'sm' Agregar va aquí y ocupa el espacio disponible */}
            <button
              type="button"
              onClick={manejarAgregar}
              disabled={agotado}
              className="boton-primario order-last hidden flex-1 !px-3 !py-2 text-sm sm:inline-flex"
            >
              <IconoBolsa className="h-4 w-4" />
              {agotado ? 'Agotado' : 'Agregar'}
            </button>

            <button
              type="button"
              onClick={manejarCompartir}
              aria-label={`Compartir ${producto.nombre}`}
              className="ml-auto rounded-full border border-malva-200 p-2 text-malva-500 transition
                hover:border-rosa-300 hover:text-rosa-600 dark:border-malva-700 sm:ml-0"
            >
              <IconoCompartir className="h-4 w-4" />
            </button>
          </div>

          {/* Agregar a ancho completo (solo móvil) */}
          <button
            type="button"
            onClick={manejarAgregar}
            disabled={agotado}
            className="boton-primario w-full !px-3 !py-2 text-xs sm:hidden"
          >
            <IconoBolsa className="h-4 w-4" />
            {agotado ? 'Agotado' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
