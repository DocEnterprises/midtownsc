/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_MAPBOX_TOKEN: string
  readonly VITE_CHAT_WS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}