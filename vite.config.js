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
        plugins: [
            isDev && mkcert(),
        ].filter(Boolean),
    };
});
