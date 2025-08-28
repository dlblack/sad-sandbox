import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

export default defineConfig({
    plugins: [
        react(),
        electron([
            {
                entry: 'src-electron/main.js',
                onstart({ startup }) {
                    startup();
                },
                vite: {
                    build: { outDir: 'dist-electron', minify: false },
                },
            },
            {
                entry: 'src-electron/preload.js',
                onstart({ reload }) {
                    reload();
                },
                vite: {
                    build: { outDir: 'dist-electron', minify: false },
                },
            },
        ]),
    ],
    server: {
        proxy: {
            '/api': 'http://localhost:5001',
        },
    },
    build: {
        outDir: "dist",
    },
});
