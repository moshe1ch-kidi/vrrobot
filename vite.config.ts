mport { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // זה מוודא שהנתיבים יהיו יחסיים ולא יישברו
})
