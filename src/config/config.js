/**
 * config.js
 * ---------
 * Configuración central de la tienda.
 *
 * CONFIG_BASE son los valores por defecto que viajan con el código.
 * El panel de administración (#/admin) puede sobrescribirlos; esos cambios
 * se guardan en localStorage bajo CLAVE_CONFIG y tienen prioridad.
 */

export const CLAVE_CONFIG = 'tienda_config';

export const CONFIG_BASE = {
  // Número de WhatsApp que recibirá los pedidos.
  // Formato internacional SIN "+" ni espacios. Ej. México: 52 + 10 dígitos.
  whatsapp: '529831242878',

  nombreTienda: 'Bella Amelí',
  eslogan: 'NICE · Farmasi · Natura',

  banner: {
    titulo: 'Belleza que llega hasta tu puerta',
    subtitulo:
      'Descubre lo nuevo de NICE, Farmasi y Natura. Arma tu pedido y recíbelo sin salir de casa.',
    textoBoton: 'Ver catálogo',
    imagen: '/imagenes/banners/principal.jpg',
  },
};

/** Devuelve la configuración vigente (base + cambios del panel admin). */
export function obtenerConfig() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_CONFIG) || 'null');
    if (guardada && typeof guardada === 'object') {
      return {
        ...CONFIG_BASE,
        ...guardada,
        banner: { ...CONFIG_BASE.banner, ...(guardada.banner || {}) },
      };
    }
  } catch {
    /* localStorage corrupto o no disponible: usamos la base */
  }
  return CONFIG_BASE;
}

/** Guarda cambios de configuración hechos desde el panel admin. */
export function guardarConfig(parcial) {
  const actual = obtenerConfig();
  const nueva = {
    ...actual,
    ...parcial,
    banner: { ...actual.banner, ...(parcial.banner || {}) },
  };
  localStorage.setItem(CLAVE_CONFIG, JSON.stringify(nueva));
  return nueva;
}
