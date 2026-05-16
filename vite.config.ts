import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Required for Electron `file://` loading.
  // Ensures asset URLs are relative instead of starting with `/`.
  base: './',
})

