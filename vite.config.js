import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded smoothly in Capacitor mobile app
  server: {
    proxy: {
      '/higgsfield': {
        target: 'https://platform.higgsfield.ai',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/higgsfield/, ''),
      },
    },
  },
})
