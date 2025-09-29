import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // /api/catalog/...  ->  http://localhost:4101/...
      '/api/catalog': {
        target: 'http://localhost:4101',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/catalog/, '')
      },
      // /api/cart/...  ->  http://localhost:4102/...
      '/api/cart': {
        target: 'http://localhost:4102',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cart/, '')
      },
      // /api/order/...  ->  http://localhost:4103/...
      '/api/order': {
        target: 'http://localhost:4103',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/order/, '')
      }
    }
  }
})
