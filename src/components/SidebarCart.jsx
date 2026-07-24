/**
 * SidebarCart.jsx
 * ---------------
 * Carrito lateral que se desliza desde la derecha.
 * Muestra cada artículo (imagen, nombre, precio, cantidad, subtotal),
 * permite modificar cantidades y eliminar, y calcula el total en vivo.
 * "Finalizar compra" abre el formulario de datos del cliente
 * (CheckoutForm) antes de enviar el pedido por WhatsApp.
 */

import { memo, useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import CheckoutForm from './CheckoutForm.jsx';
import { IconoBasura, IconoBolsa, IconoCerrar, IconoMas, IconoMenos } from './Icons.jsx';

function SidebarCart() {
  const {
    items,
    total,
    cantidadArticulos,
    carritoAbierto,
    cerrarCarrito,
    cambiarCantidad,
    quitarDelCarrito,
    vaciarCarrito,
  } = useCart();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Cierra con Escape y bloquea el scroll del fondo mientras está abierto
  useEffect(() => {
    if (!carritoAbierto) return;
    const alTeclear = (e) => e.key === 'Escape' && cerrarCarrito();
    window.addEventListener('keydown', alTeclear);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = '';
    };
  }, [carritoAbierto, cerrarCarrito]);

  if (!carritoAbierto) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrito de compras">
      {/* Fondo oscurecido */}
      <div
        className="absolute inset-0 bg-malva-950/50 backdrop-blur-sm"
        onClick={cerrarCarrito}
        aria-hidden
      />

      {/* Panel lateral */}
      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-deslizar-izquierda flex-col
          bg-white shadow-suave dark:bg-malva-900"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-malva-100 px-5 py-4 dark:border-malva-800">
          <h2 className="font-display text-xl font-semibold">
            Tu carrito
            {cantidadArticulos > 0 && (
              <span className="ml-2 text-sm font-normal text-malva-500">
                ({cantidadArticulos} {cantidadArticulos === 1 ? 'artículo' : 'artículos'})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={cerrarCarrito}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 text-malva-500 transition hover:bg-malva-100 dark:hover:bg-malva-800"
          >
            <IconoCerrar />
          </button>
        </div>

        {/* Lista de artículos */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="rounded-full bg-rosa-50 p-5 text-rosa-400 dark:bg-rosa-950/40">
                <IconoBolsa className="h-8 w-8" />
              </span>
              <p className="font-display text-lg">Tu carrito está vacío</p>
              <p className="text-sm text-malva-500 dark:text-malva-400">
                Agrega productos del catálogo para armar tu pedido.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  {/* Imagen */}
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                    className="h-20 w-20 flex-none rounded-2xl bg-malva-100 object-cover dark:bg-malva-800"
                  />

                  {/* Datos */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-rosa-600 dark:text-rosa-400">
                      {item.marca}
                    </p>
                    <p className="truncate text-sm font-semibold">{item.nombre}</p>
                    <p className="text-xs text-malva-500">
                      {formatCurrency(item.precio)} c/u
                    </p>

                    {/* Cantidad */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-malva-200 dark:border-malva-700">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                          aria-label="Disminuir cantidad"
                          className="p-1.5 text-malva-500 hover:text-rosa-600"
                        >
                          <IconoMenos className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock}
                          aria-label="Aumentar cantidad"
                          className="p-1.5 text-malva-500 hover:text-rosa-600 disabled:opacity-40"
                        >
                          <IconoMas className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => quitarDelCarrito(item.id)}
                        aria-label={`Eliminar ${item.nombre}`}
                        className="rounded-full p-1.5 text-malva-400 transition hover:text-red-500"
                      >
                        <IconoBasura className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal por artículo */}
                  <p className="text-sm font-bold">{formatCurrency(item.precio * item.cantidad)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pie: total y acciones */}
        {items.length > 0 && (
          <div className="border-t border-malva-100 px-5 py-4 dark:border-malva-800">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-malva-500 dark:text-malva-400">Total</span>
              <span className="font-display text-2xl font-semibold">{formatCurrency(total)}</span>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={vaciarCarrito} className="boton-secundario flex-none">
                Vaciar
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(true)}
                className="boton-primario flex-1"
              >
                Finalizar compra
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-malva-400">
              El pedido se envía por WhatsApp. No se realizan pagos en línea.
            </p>
          </div>
        )}
      </aside>

      {/* Formulario de datos del cliente antes de WhatsApp */}
      {mostrarFormulario && <CheckoutForm onCerrar={() => setMostrarFormulario(false)} />}
    </div>
  );
}

export default memo(SidebarCart);
