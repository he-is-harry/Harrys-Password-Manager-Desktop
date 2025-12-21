import { safeStorage, app } from 'electron';
import fs from 'fs';
import path from 'path';

export const KEY_TYPE = {
  ENCRYPTION_KEY: 'encryption_key',
  DECRYPTION_KEY: 'decryption_key'
} as const;
export type KeyType = (typeof KEY_TYPE)[keyof typeof KEY_TYPE];

const getKeyFilePath = (key: KeyType): string => {
  const keyFileName =
    key === KEY_TYPE.ENCRYPTION_KEY
      ? import.meta.env.MAIN_VITE_DEVICE_ENCRYPTION_KEY_NAME
      : import.meta.env.MAIN_VITE_DEVICE_DECRYPTION_KEY_NAME;
  return path.join(app.getPath('userData'), keyFileName);
};

export const SecureStore = {
  saveKey: (key: KeyType, keyBuffer: Buffer): void => {
    if (!safeStorage.isEncryptionAvailable())
      throw new Error('Encryption for secure store is not available');

    const keyFilePath = getKeyFilePath(key);

    const keyString = keyBuffer.toString('base64');

    const encryptedBuffer = safeStorage.encryptString(keyString);

    fs.writeFileSync(keyFilePath, encryptedBuffer);
  },

  getKey: (key: KeyType): Buffer<ArrayBuffer> | null => {
    const keyFilePath = getKeyFilePath(key);
    if (!fs.existsSync(keyFilePath)) return null;

    const encryptedBuffer = fs.readFileSync(keyFilePath);

    const keyString = safeStorage.decryptString(encryptedBuffer);

    return Buffer.from(keyString, 'base64');
  }
};
