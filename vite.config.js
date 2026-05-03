import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
