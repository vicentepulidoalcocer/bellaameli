/**
 * Icons.jsx
 * ---------
 * Iconos SVG inline reutilizables. Evita dependencias externas y
 * mantiene un solo lugar donde ajustar trazos y tamaños.
 * Todos aceptan `className` para dimensionarlos con Tailwind.
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

export const IconoBolsa = ({ className = 'h-5 w-5' }) => (
  <svg {...base} className={className}>
    <path d="M6 7h12l1 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L6 7Z" />
    <path d="M9 10V6a3 3 0 0 1 6 0v4" />
  </svg>
);

export const IconoBuscar = ({ className = 'h-5 w-5' }) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconoCorazon = ({ className = 'h-5 w-5', relleno = false }) => (
  <svg {...base} fill={relleno ? 'currentColor' : 'none'} className={className}>
    <path d="M12 20.5c-4.5-3-8-6-8-9.8C4 8 6 6 8.5 6c1.6 0 2.8.8 3.5 2 .7-1.2 1.9-2 3.5-2C18 6 20 8 20 10.7c0 3.8-3.5 6.8-8 9.8Z" />
  </svg>
);

export const IconoCompartir = ({ className = 'h-5 w-5' }) => (
  <svg {...base} className={className}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="17" cy="6" r="2.5" />
    <circle cx="17" cy="18" r="2.5" />
    <path d="m8.3 10.8 6.4-3.6M8.3 13.2l6.4 3.6" />
  </svg>
);

export const IconoCerrar = ({ className = 'h-5 w-5' }) => (
  <svg {...base} className={className}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconoBasura = ({ className = 'h-5 w-5' }) => (
  <svg {...base} className={className}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconoSol = ({ className = 'h-5 w-5' }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconoLuna = ({ className = 'h-5 w-5' }) => (
  <svg {...base} className={className}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
);

export const IconoWhatsApp = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5v-.5L9.7 8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.1 2.2-.2 3.7a11 11 0 0 0 4.5 4c.6.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.3-.2Z" />
  </svg>
);

export const IconoMas = ({ className = 'h-4 w-4' }) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconoMenos = ({ className = 'h-4 w-4' }) => (
  <svg {...base} className={className}>
    <path d="M5 12h14" />
  </svg>
);

/** Logo de la tienda: flor minimalista dentro de un círculo. */
export const LogoFlor = ({ className = 'h-9 w-9' }) => (
  <svg viewBox="0 0 40 40" aria-hidden className={className}>
    <circle cx="20" cy="20" r="19" fill="currentColor" opacity="0.12" />
    {[0, 60, 120, 180, 240, 300].map((angulo) => (
      <ellipse
        key={angulo}
        cx="20"
        cy="12.5"
        rx="4"
        ry="7"
        fill="currentColor"
        opacity="0.85"
        transform={`rotate(${angulo} 20 20)`}
      />
    ))}
    <circle cx="20" cy="20" r="3.4" fill="#fff" />
  </svg>
);
