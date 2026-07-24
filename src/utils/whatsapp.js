/**
 * whatsapp.js
 * -----------
 * Construye el mensaje del pedido (agrupado por marca, con datos del
 * cliente y total) y genera el enlace wa.me listo para abrir.
 */

import { formatCurrency } from './formatCurrency.js';

/**
 * Construye el texto del pedido con el formato solicitado.
 * @param {{nombre:string, telefono:string, municipio:string, comentarios:string}} cliente
 * @param {Array<{marca:string, nombre:string, cantidad:number, precio:number}>} items
 * @param {number} total
 * @returns {string} Mensaje en texto plano.
 */
export function construirMensajePedido(cliente, items, total) {
  const lineas = [
    'Hola.',
    '',
    'Quiero realizar el siguiente pedido.',
    '',
    'Cliente:',
    cliente.nombre,
    '',
    'Teléfono:',
    cliente.telefono,
    '',
    'Municipio:',
    cliente.municipio,
    '',
    'Productos',
  ];

  // Agrupa los productos por marca respetando un orden fijo
  const ordenMarcas = ['NICE', 'Farmasi', 'Natura'];
  const marcasEnPedido = ordenMarcas.filter((m) => items.some((i) => i.marca === m));

  for (const marca of marcasEnPedido) {
    lineas.push('', marca);
    for (const item of items.filter((i) => i.marca === marca)) {
      lineas.push('');
      lineas.push(`• ${item.nombre}`);
      lineas.push(`Cantidad: ${item.cantidad}`);
      lineas.push(`Precio: ${formatCurrency(item.precio)}`);
    }
  }

  lineas.push('', 'TOTAL', '', formatCurrency(total));

  if (cliente.comentarios && cliente.comentarios.trim()) {
    lineas.push('', 'Comentarios:', '', cliente.comentarios.trim());
  }

  return lineas.join('\n');
}

/**
 * Genera la URL de WhatsApp con el mensaje ya codificado.
 * @param {string} numero - Número en formato internacional sin "+".
 * @param {string} mensaje - Texto del pedido.
 */
export function construirEnlaceWhatsApp(numero, mensaje) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
