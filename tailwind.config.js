/** @type {import('tailwindcss').Config} */

// Paleta "femenina y elegante":
// - rosa: frambuesa profunda para acciones principales (agregar, finalizar)
// - malva: tonos secundarios para fondos suaves y detalles
// - crema: fondo cálido en modo claro
// El modo oscuro se activa con la clase "dark" en <html> (ver useTheme.js)
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rosa: {
          50: '#fdf2f6',
          100: '#fce7ef',
          200: '#fbcfe0',
          300: '#f8a8c5',
          400: '#f272a0',
          500: '#e8477d',
          600: '#d42a63',
          700: '#b01c4e',
          800: '#921a43',
          900: '#7a1a3b',
          950: '#4a0821',
        },
        malva: {
          50: '#faf7fa',
          100: '#f4eef3',
          200: '#eadee8',
          300: '#d9c3d5',
          400: '#c09eb9',
          500: '#a67e9d',
          600: '#8c6382',
          700: '#75506b',
          800: '#614458',
          900: '#523b4b',
          950: '#301f2b',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Karla', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        suave: '0 4px 20px -4px rgba(122, 26, 59, 0.10)',
        tarjeta: '0 2px 12px -2px rgba(48, 31, 43, 0.08)',
      },
      keyframes: {
        aparecer: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        deslizarIzquierda: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        brillo: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        aparecer: 'aparecer 0.35s ease-out both',
        'deslizar-izquierda': 'deslizarIzquierda 0.3s ease-out both',
        brillo: 'brillo 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
