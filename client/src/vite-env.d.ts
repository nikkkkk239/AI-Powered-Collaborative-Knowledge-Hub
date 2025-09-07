/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // add more here if you have more env vars
  // readonly VITE_OTHER_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
