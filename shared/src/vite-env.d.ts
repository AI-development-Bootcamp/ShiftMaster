// Type definitions for Vite environment variables
// This extends the global ImportMeta interface when used in Vite environments

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
