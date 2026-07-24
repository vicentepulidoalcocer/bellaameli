import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite
// - Plugin de React con Fast Refresh
// - Code splitting manual: React y la librería xlsx (solo usada por el panel
//   de administración) se separan en chunks propios para que la tienda
//   cargue lo mínimo necesario.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          xlsx: ['xlsx'],
        },
      },
    },
  },
});
