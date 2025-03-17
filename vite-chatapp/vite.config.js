import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  test: {    
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/Tests/mock_server/server.js', 
    ]
  },
  server: {
    proxy: {
      '/api': {
        'target': 'http://localhost:5173', 
        'changeOrigin': true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});