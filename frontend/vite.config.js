// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/nexus/api': {
        target: 'http://nexus-app:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nexus\/api/, '')
      },
      '/ws': {
        target: 'http://nexus-app:8080',
        ws: true,
      },
    },
  },
})
