/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  // Define your variables here with 'readonly'
  readonly MAIN_VITE_DB_FILE_NAME: string;
  readonly MAIN_VITE_DEVICE_ENCRYPTION_KEY_NAME: string;
  readonly MAIN_VITE_DEVICE_DECRYPTION_KEY_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
