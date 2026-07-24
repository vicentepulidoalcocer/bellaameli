/**
 * CartContext.jsx
 * ---------------
 * Estado global del carrito con Context API + useReducer.
 * - Persiste automáticamente en localStorage (el carrito sobrevive
 *   aunque el usuario cierre la página).
 * - Expone acciones puras: agregar, quitar, cambiar cantidad y vaciar.
 * - Calcula total y número de artículos de forma derivada (useMemo).
 */

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { registrarAgregado } from '../services/stats.js';

const CLAVE_CARRITO = 'tienda_carrito';

const CartContext = createContext(null);

/** Carga inicial desde localStorage (lazy init del reducer). */
function cargarCarritoGuardado() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

/**
 * Reducer del carrito. Cada item guarda una "foto" del producto
 * (nombre, precio, imagen...) más la cantidad elegida.
 */
function carritoReducer(items, accion) {
  switch (accion.tipo) {
    case 'AGREGAR': {
      const { producto, cantidad } = accion;
      const existente = items.find((i) => i.id === producto.id);
      const stock = producto.stock ?? Infinity;

      if (existente) {
        return items.map((i) =>
          i.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + cantidad, stock) }
            : i
        );
      }
      return [
        ...items,
        {
          id: producto.id,
          nombre: producto.nombre,
          marca: producto.marca,
          precio: producto.precio,
          imagen: producto.imagen,
          stock,
          cantidad: Math.min(cantidad, stock),
        },
      ];
    }
    case 'CAMBIAR_CANTIDAD': {
      const { id, cantidad } = accion;
      if (cantidad <= 0) return items.filter((i) => i.id !== id);
      return items.map((i) =>
        i.id === id ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i
      );
    }
    case 'QUITAR':
      return items.filter((i) => i.id !== accion.id);
    case 'VACIAR':
      return [];
    default:
      return items;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(carritoReducer, undefined, cargarCarritoGuardado);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // Persistencia: cada cambio del carrito se refleja en localStorage
  useEffect(() => {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  }, [items]);

  // Valores derivados memorizados para evitar cálculos repetidos
  const total = useMemo(
    () => items.reduce((suma, i) => suma + i.precio * i.cantidad, 0),
    [items]
  );
  const cantidadArticulos = useMemo(
    () => items.reduce((suma, i) => suma + i.cantidad, 0),
    [items]
  );

  const valor = useMemo(
    () => ({
      items,
      total,
      cantidadArticulos,
      carritoAbierto,
      abrirCarrito: () => setCarritoAbierto(true),
      cerrarCarrito: () => setCarritoAbierto(false),
      agregarAlCarrito: (producto, cantidad = 1) => {
        dispatch({ tipo: 'AGREGAR', producto, cantidad });
        registrarAgregado(producto.id, cantidad); // estadística local
      },
      cambiarCantidad: (id, cantidad) => dispatch({ tipo: 'CAMBIAR_CANTIDAD', id, cantidad }),
      quitarDelCarrito: (id) => dispatch({ tipo: 'QUITAR', id }),
      vaciarCarrito: () => dispatch({ tipo: 'VACIAR' }),
    }),
    [items, total, cantidadArticulos, carritoAbierto]
  );

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

/** Acceso al contexto con validación de uso correcto. */
export function useCartContext() {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error('useCartContext debe usarse dentro de <CartProvider>');
  }
  return contexto;
}
