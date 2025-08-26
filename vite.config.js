import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

export default defineConfig({
    plugins: [
        react(),
        electron({
            main: {
                entry: 'src-electron/main.js',
                vite: {
                    build: { outDir: 'dist-electron' },
                },
            },
            preload: {
                input: { preload: 'src-electron/preload.js' },
                vite: {
                    build: { outDir: 'dist-electron' },
                },
            },
        }),
    ],
    server: {
        proxy: { '/api': 'http://localhost:5001' },
    },
});
