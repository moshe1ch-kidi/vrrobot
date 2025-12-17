import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '', // הוספת השורה הזו פותרת את בעיית ה-404 של הקבצים
})
