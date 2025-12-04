import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Loanmaneger/',   // 👈 repo name + /  at both sides
})
