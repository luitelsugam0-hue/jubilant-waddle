import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

 // https://vitejs.dev/config/
export default defineConfig({ 
    plugins: [react()],
    server: {
        // This line tells Vite to allow your Render URL
    allowedHosts: true
    }
}) 
