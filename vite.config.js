import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "d10f-62-3-44-234.ngrok-free.app", // Старый хост
      "7ab8-62-3-44-234.ngrok-free.app", // Новый хост
      "localhost",
      "127.0.0.1"
    ],
    port: 5173, // Убедитесь, что порт совпадает с вашим локальным сервером
  },
});