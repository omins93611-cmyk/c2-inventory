import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  base: '/c2-inventory/',

  server: {
    host: true,
    port: 5173,
  },
})