import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - bibliotecas grandes separadas
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'utils': ['axios', 'jwt-decode'],
        },
      },
    },
    // Otimizações de build
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild', // Usa esbuild (mais rápido e já incluído)
  },
  // Performance otimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material'],
  },
});