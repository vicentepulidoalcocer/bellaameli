/**
 * useFavorites.js
 * ---------------
 * Lista de favoritos persistida en localStorage. Se guarda solo el ID
 * de cada producto, para que sobreviva a cambios de precio o nombre.
 */

import { useCallback, useEffect, useState } from 'react';

const CLAVE_FAVORITOS = 'tienda_favoritos';

function cargarFavoritos() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favoritos, setFavoritos] = useState(cargarFavoritos);

  useEffect(() => {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
  }, [favoritos]);

  const esFavorito = useCallback((id) => favoritos.includes(id), [favoritos]);

  const alternarFavorito = useCallback((id) => {
    setFavoritos((previos) =>
      previos.includes(id) ? previos.filter((f) => f !== id) : [...previos, id]
    );
  }, []);

  return { favoritos, esFavorito, alternarFavorito };
}
