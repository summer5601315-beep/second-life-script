import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://summer5601315-beep.github.io/second-life-script/
export default defineConfig({
  plugins: [react()],
  base: '/second-life-script/',
})
