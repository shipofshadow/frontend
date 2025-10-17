import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['ischolar.test'],
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react()],
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  }

});
