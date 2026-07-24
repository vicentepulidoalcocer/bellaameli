/**
 * ToastContext.jsx
 * ----------------
 * Notificaciones tipo "toast" (ej. al agregar un producto al carrito).
 * Cualquier componente puede llamar mostrarToast(mensaje, tipo) sin
 * preocuparse por el renderizado: el contenedor vive aquí.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const DURACION_MS = 2600;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const contadorRef = useRef(0);

  const mostrarToast = useCallback((mensaje, tipo = 'exito') => {
    const id = ++contadorRef.current;
    setToasts((previos) => [...previos, { id, mensaje, tipo }]);
    // Autodestrucción del toast pasada la duración
    setTimeout(() => {
      setToasts((previos) => previos.filter((t) => t.id !== id));
    }, DURACION_MS);
  }, []);

  const valor = useMemo(() => ({ mostrarToast }), [mostrarToast]);

  return (
    <ToastContext.Provider value={valor}>
      {children}

      {/* Contenedor de toasts, siempre por encima de todo */}
      <div
        className="fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-aparecer rounded-2xl px-4 py-3 text-sm font-medium shadow-suave backdrop-blur
              ${
                toast.tipo === 'error'
                  ? 'bg-red-600/95 text-white'
                  : toast.tipo === 'info'
                    ? 'bg-malva-800/95 text-white'
                    : 'bg-rosa-700/95 text-white'
              }`}
          >
            {toast.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return contexto;
}
