/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOALS_PATH: string
  readonly VITE_OBSIDIAN_API_URL: string
  readonly VITE_OBSIDIAN_API_KEY: string
  readonly VITE_USE_MOCK_DATA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: Error) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'virtual:goals' {
  export interface GoalFile {
    path: string;
    category: string;
    content: string;
  }
  export const goalFiles: GoalFile[];
}
