// custom.d.ts
// Type declarations for importing static assets and Vite env

declare module '*.mp4';
declare module '*.webm';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  // add other VITE_ vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
