/**
 * useTheme.js
 * -----------
 * Modo claro / oscuro con persistencia.
 * - Guarda la preferencia en localStorage ('tienda_tema').
 * - Aplica/retira la clase "dark" en <html> (estrategia de Tailwind).
 * - index.html aplica el tema guardado antes del primer render para
 *   evitar parpadeos.
 */

import { useCallback, useEffect, useState } from 'react';

const CLAVE_TEMA = 'tienda_tema';

function temaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA);
    if (guardado === 'claro' || guardado === 'oscuro') return guardado;
  } catch {
    /* sin localStorage */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

export function useTheme() {
  const [tema, setTema] = useState(temaInicial);

  // Sincroniza la clase en <html> y la preferencia guardada
  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro');
    try {
      localStorage.setItem(CLAVE_TEMA, tema);
    } catch {
      /* sin localStorage */
    }
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((t) => (t === 'claro' ? 'oscuro' : 'claro'));
  }, []);

  return { tema, alternarTema };
}
