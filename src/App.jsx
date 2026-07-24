/**
 * App.jsx
 * -------
 * Composición raíz de la aplicación:
 * - Providers globales (carrito y toasts).
 * - Enrutamiento ligero por hash:
 *     "/"        -> Tienda (Home)
 *     "#/admin"  -> Panel de administración
 * - El panel admin se carga de forma diferida (React.lazy) para que
 *   los clientes de la tienda nunca descarguen ese código.
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Home from './pages/Home.jsx';

// Code splitting: Admin (y la librería xlsx que usa) viajan en su propio chunk
const Admin = lazy(() => import('./pages/Admin.jsx'));

/** Hook mínimo de enrutamiento por hash (sin dependencias externas). */
function useRutaHash() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const alCambiar = () => setHash(window.location.hash);
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  return hash;
}

export default function App() {
  const hash = useRutaHash();
  const esAdmin = hash.startsWith('#/admin');

  return (
    <ToastProvider>
      <CartProvider>
        {esAdmin ? (
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center text-malva-500">
                Cargando panel…
              </div>
            }
          >
            <Admin />
          </Suspense>
        ) : (
          <Home />
        )}
      </CartProvider>
    </ToastProvider>
  );
}
