import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "build",
        target: "es2017",
        minify: false,
        sourcemap: true,
        rollupOptions: {
            input: {
                content: "./src/content/index.tsx",
            },
            output: {
                format: "iife",
                entryFileNames: "content.js",
                chunkFileNames: "assets/[name]-[hash].js",
            },
        },
    },
});
