/**
 * useCart.js
 * ----------
 * Hook de conveniencia para consumir el carrito desde cualquier componente.
 * Mantiene la UI desacoplada de la implementación interna del contexto:
 * los componentes importan useCart y no necesitan saber cómo se guarda
 * o calcula nada.
 */

import { useCartContext } from '../context/CartContext.jsx';

export function useCart() {
  return useCartContext();
}
