/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // tambahkan env lain jika perlu
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
