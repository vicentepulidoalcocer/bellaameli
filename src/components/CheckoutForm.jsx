/**
 * CheckoutForm.jsx
 * ----------------
 * Formulario previo al envío del pedido: nombre, teléfono, municipio y
 * comentarios. Al confirmar:
 *  1. Construye el mensaje agrupado por marca (utils/whatsapp.js)
 *  2. Abre WhatsApp con el mensaje listo para enviar
 *  3. Registra la estadística local y vacía el carrito
 */

import { memo, useState } from 'react';
import { useCart } from '../hooks/useCart.js';
import { useToast } from '../context/ToastContext.jsx';
import { obtenerConfig } from '../config/config.js';
import { registrarPedido } from '../services/stats.js';
import { construirEnlaceWhatsApp, construirMensajePedido } from '../utils/whatsapp.js';
import { IconoCerrar, IconoWhatsApp } from './Icons.jsx';

function CheckoutForm({ onCerrar }) {
  const { items, total, vaciarCarrito, cerrarCarrito } = useCart();
  const { mostrarToast } = useToast();

  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    municipio: '',
    comentarios: '',
  });
  const [errores, setErrores] = useState({});

  const actualizar = (campo) => (e) =>
    setCliente((c) => ({ ...c, [campo]: e.target.value }));

  /** Validación mínima antes de abrir WhatsApp. */
  const validar = () => {
    const nuevos = {};
    if (!cliente.nombre.trim()) nuevos.nombre = 'Escribe tu nombre.';
    if (!/^[\d\s()+-]{8,15}$/.test(cliente.telefono.trim()))
      nuevos.telefono = 'Escribe un teléfono válido (8 a 15 dígitos).';
    if (!cliente.municipio.trim()) nuevos.municipio = 'Indica tu municipio.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const enviarPedido = () => {
    if (!validar()) return;

    const config = obtenerConfig();
    const mensaje = construirMensajePedido(cliente, items, total);
    const enlace = construirEnlaceWhatsApp(config.whatsapp, mensaje);

    // Abre WhatsApp en una pestaña nueva con el pedido listo
    window.open(enlace, '_blank', 'noopener');

    registrarPedido(total); // estadística local para el panel admin
    mostrarToast('Pedido enviado a WhatsApp. ¡Gracias!');
    vaciarCarrito();
    onCerrar();
    cerrarCarrito();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-malva-950/50 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Datos para tu pedido"
    >
      <div
        className="w-full max-w-md animate-aparecer rounded-t-3xl bg-white p-6 shadow-suave dark:bg-malva-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Datos para tu pedido</h2>
            <p className="mt-1 text-sm text-malva-500 dark:text-malva-400">
              Se incluirán en el mensaje de WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar formulario"
            className="rounded-full p-2 text-malva-500 transition hover:bg-malva-100 dark:hover:bg-malva-800"
          >
            <IconoCerrar />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="pedido-nombre">
              Nombre
            </label>
            <input
              id="pedido-nombre"
              type="text"
              className="campo"
              placeholder="Ej. Juan Pérez"
              value={cliente.nombre}
              onChange={actualizar('nombre')}
            />
            {errores.nombre && <p className="mt-1 text-xs text-red-500">{errores.nombre}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="pedido-telefono">
              Teléfono
            </label>
            <input
              id="pedido-telefono"
              type="tel"
              className="campo"
              placeholder="Ej. 9991234567"
              value={cliente.telefono}
              onChange={actualizar('telefono')}
            />
            {errores.telefono && <p className="mt-1 text-xs text-red-500">{errores.telefono}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="pedido-municipio">
              Municipio
            </label>
            <input
              id="pedido-municipio"
              type="text"
              className="campo"
              placeholder="Ej. José María Morelos"
              value={cliente.municipio}
              onChange={actualizar('municipio')}
            />
            {errores.municipio && <p className="mt-1 text-xs text-red-500">{errores.municipio}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="pedido-comentarios">
              Comentarios <span className="font-normal text-malva-400">(opcional)</span>
            </label>
            <textarea
              id="pedido-comentarios"
              rows={3}
              className="campo resize-none"
              placeholder="Ej. Entregar después de las 5 PM"
              value={cliente.comentarios}
              onChange={actualizar('comentarios')}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={enviarPedido}
          className="boton-primario mt-5 w-full !bg-[#25D366] hover:!bg-[#1fb459]"
        >
          <IconoWhatsApp />
          Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  );
}

export default memo(CheckoutForm);
