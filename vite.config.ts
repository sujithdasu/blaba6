
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "4ee933cf-d0cb-452c-aa08-d8776f0bc344-00-fsqptjuif4ug.pike.replit.dev"
    ]
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
}));
