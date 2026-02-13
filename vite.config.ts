import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    build: {
        minify: 'esbuild',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                antichrome: path.resolve(__dirname, 'antichrome.html'),
                carbon: path.resolve(__dirname, 'carbon.html'),
                contacts: path.resolve(__dirname, 'contacts.html'),
                portfolio: path.resolve(__dirname, 'portfolio.html'),
                reviews: path.resolve(__dirname, 'reviews.html'),
                services: path.resolve(__dirname, 'services.html'),
                shum: path.resolve(__dirname, 'shum.html'),
                news: path.resolve(__dirname, 'news.html'),
                'news-detail': path.resolve(__dirname, 'news-detail.html'),
                privacy: path.resolve(__dirname, 'privacy.html'),
            },
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
            },
        },
    },
    esbuild: {
        drop: ['console', 'debugger'],
    },
});
