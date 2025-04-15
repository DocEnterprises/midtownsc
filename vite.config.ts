import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8888",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  define: {
    "process.env.VITE_STRIPE_PUBLIC_KEY": JSON.stringify(
      process.env.VITE_STRIPE_PUBLIC_KEY
    ),
    "process.env.VITE_MAPBOX_TOKEN": JSON.stringify(
      process.env.VITE_MAPBOX_TOKEN
    ),
    "process.env.VITE_CHAT_WS_URL": JSON.stringify(
      process.env.VITE_CHAT_WS_URL
    ),
    "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
    "process.env.VITE_FIREBASE_API_KEY": JSON.stringify(
      process.env.VITE_FIREBASE_API_KEY
    ),
    "process.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(
      process.env.VITE_FIREBASE_AUTH_DOMAIN
    ),
    "process.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_FIREBASE_PROJECT_ID
    ),
    "process.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(
      process.env.VITE_FIREBASE_STORAGE_BUCKET
    ),
    "process.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    ),
    "process.env.VITE_FIREBASE_APP_ID": JSON.stringify(
      process.env.VITE_FIREBASE_APP_ID
    ),
  },
});