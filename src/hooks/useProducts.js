/**
 * useProducts.js
 * --------------
 * Carga el catálogo (de forma diferida) y expone el estado de carga
 * para que la UI muestre los "skeletons" mientras tanto.
 */

import { useEffect, useState } from 'react';
import { cargarProductos } from '../services/products.js';

export function useProducts() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true; // evita actualizar estado si el componente se desmonta

    cargarProductos()
      .then((datos) => {
        if (activo) setProductos(datos);
      })
      .catch((e) => {
        console.error('Error al cargar el catálogo:', e);
        if (activo) setError('No se pudo cargar el catálogo.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return { productos, cargando, error };
}
