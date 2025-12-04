import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on the current mode (e.g. "production" or "development")
    const env = loadEnv(mode, process.cwd())

    console.log('Loaded env:', env.VITE_API_BASE_URL)

    return {
        server: {
            host: '0.0.0.0',
            port: 5173,
            allowedHosts: ['ischolar.xyz'],
            strictPort: true,
        },
        plugins: [react()],
        base: '/',
        define: {
            __APP_VERSION__: JSON.stringify('1.0.0'),
            // Make your environment variables available in the app
            'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
        },
    }
})
