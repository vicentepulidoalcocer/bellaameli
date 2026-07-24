/**
 * ProductModal.jsx
 * ----------------
 * Vista rápida de un producto (al hacer clic en su imagen):
 * descripción completa, precio, botón de agregar y una sección de
 * productos relacionados (misma marca o categoría).
 */

import { memo, useEffect, useMemo, useState } from 'react';
import { useCart } from '../hooks/useCart.js';
import { useToast } from '../context/ToastContext.jsx';
import { productosRelacionados } from '../services/products.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { IconoBolsa, IconoCerrar } from './Icons.jsx';

function ProductModal({ producto, productos, onCerrar, onVerDetalle }) {
  const { agregarAlCarrito, abrirCarrito } = useCart();
  const { mostrarToast } = useToast();
  const [imagenFallo, setImagenFallo] = useState(false);

  // Cierra con la tecla Escape
  useEffect(() => {
    const alTeclear = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [onCerrar]);

  // Reinicia el estado de la imagen al cambiar de producto
  useEffect(() => setImagenFallo(false), [producto]);

  const relacionados = useMemo(
    () => (producto ? productosRelacionados(productos, producto) : []),
    [productos, producto]
  );

  if (!producto) return null;

  const agotado = producto.stock <= 0;

  const manejarAgregar = () => {
    agregarAlCarrito(producto, 1);
    mostrarToast(`${producto.nombre} agregado al carrito`);
    onCerrar();
    abrirCarrito();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-malva-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${producto.nombre}`}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl animate-aparecer overflow-y-auto rounded-t-3xl bg-white
          shadow-suave dark:bg-malva-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid sm:grid-cols-2">
          {/* Imagen */}
          <div className="relative aspect-square bg-malva-100 dark:bg-malva-800">
            {imagenFallo ? (
              <span className="flex h-full items-center justify-center px-4 text-center font-display text-xl text-malva-400">
                {producto.nombre}
              </span>
            ) : (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                onError={() => setImagenFallo(true)}
                className="h-full w-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-malva-600 shadow-tarjeta
                transition hover:text-rosa-600 dark:bg-malva-950/80 dark:text-malva-200"
            >
              <IconoCerrar />
            </button>
          </div>

          {/* Información */}
          <div className="flex flex-col p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rosa-600 dark:text-rosa-400">
              {producto.marca} · {producto.categoria}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{producto.nombre}</h2>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatCurrency(producto.precio)}</span>
              {producto.precioAnterior > producto.precio && (
                <span className="text-malva-400 line-through">
                  {formatCurrency(producto.precioAnterior)}
                </span>
              )}
            </div>

            <p className="mt-4 flex-1 text-sm leading-relaxed text-malva-600 dark:text-malva-300">
              {producto.descripcion || 'Consulta disponibilidad y detalles por WhatsApp.'}
            </p>

            <p className="mt-4 text-xs text-malva-500 dark:text-malva-400">
              {agotado ? 'Sin existencias por el momento' : `${producto.stock} disponibles`}
            </p>

            <button
              type="button"
              onClick={manejarAgregar}
              disabled={agotado}
              className="boton-primario mt-4 w-full"
            >
              <IconoBolsa className="h-4 w-4" />
              {agotado ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <div className="border-t border-malva-100 p-6 dark:border-malva-800">
            <h3 className="font-display text-lg font-semibold">También te puede gustar</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {relacionados.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onVerDetalle(rel)}
                  className="group overflow-hidden rounded-2xl bg-malva-50 text-left transition
                    hover:shadow-tarjeta dark:bg-malva-800"
                >
                  <div className="aspect-square overflow-hidden bg-malva-100 dark:bg-malva-700">
                    <img
                      src={rel.imagen}
                      alt={rel.nombre}
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-medium">{rel.nombre}</p>
                    <p className="text-xs font-bold text-rosa-700 dark:text-rosa-400">
                      {formatCurrency(rel.precio)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProductModal);
