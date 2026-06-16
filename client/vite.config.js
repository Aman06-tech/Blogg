import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../api/public',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:6789',
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});
