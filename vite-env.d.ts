/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: string;
    readonly VITE_LOG_ENABLED: string;
    readonly VITE_MINIMUM_LOG_LEVEL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
