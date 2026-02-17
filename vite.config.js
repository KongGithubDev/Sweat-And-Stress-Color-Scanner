import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        server: {
            host: '0.0.0.0',
            https: isDev,
            port: 5173,
            strictPort: true,
        },
        preview: {
            allowedHosts: ['sweat-and-stress-color-scanner.onrender.com'],
        },
        plugins: [
            isDev && mkcert(),
        ].filter(Boolean),
    };
});
