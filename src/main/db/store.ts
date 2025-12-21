import { app } from 'electron';
import path from 'path';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { createQueries, createStore } from 'tinybase/with-schemas';
import {
  createSqlite3Persister,
  Sqlite3Persister
} from 'tinybase/persisters/persister-sqlite3/with-schemas';

const TABLES = {
  passwords: {
    name: { type: 'string' },
    argon2Salt: { type: 'string' },
    hkdfSalt: { type: 'string' },
    kemNonce: { type: 'string' },
    kemCiphertext: { type: 'string' },
    passwordNonce: { type: 'string' },
    passwordCiphertext: { type: 'string' },
    updatedAt: { type: 'string' }
  }
} as const;

export const LOGIN_ARGON2_SALT = 'loginArgon2Salt';
export const LOGIN_VAULT_KEY_CIPHERTEXT = 'loginVaultKeyCiphertext';
export const LOGIN_VAULT_KEY_NONCE = 'loginVaultKeyNonce';
export const LOGIN_COMPLETED_ONBOARDING = 'loginCompletedOnboarding';
export const LOGIN_HAS_BIOMETRIC_AUTH = 'loginHasBiometricAuth';
export const DEVICE_KEY_ENCRYPTION_KEY_CIPHERTEXT = 'deviceKeyEncryptionKeyCiphertext';
export const DEVICE_KEY_ENCRYPTION_KEY_NONCE = 'deviceKeyEncryptionKeyNonce';
export const DEVICE_KEY_DECRYPTION_KEY_CIPHERTEXT = 'deviceKeyDecryptionKeyCiphertext';
export const DEVICE_KEY_DECRYPTION_KEY_NONCE = 'deviceKeyDecryptionKeyNonce';

const VALUES = {
  [LOGIN_ARGON2_SALT]: { type: 'string' },
  [LOGIN_VAULT_KEY_CIPHERTEXT]: { type: 'string' },
  [LOGIN_VAULT_KEY_NONCE]: { type: 'string' },
  [LOGIN_COMPLETED_ONBOARDING]: { type: 'boolean', default: false },
  [LOGIN_HAS_BIOMETRIC_AUTH]: { type: 'boolean', default: false }
} as const;

type Schemas = [typeof TABLES, typeof VALUES];

export const store = createStore().setTablesSchema(TABLES).setValuesSchema(VALUES);
export const queries = createQueries(store);

// Define references for persistence (to prevent Garbage Collection)
// We export them in case other files need direct access later
export let db: DatabaseType;
export let persister: Sqlite3Persister<Schemas>;

const dbName = import.meta.env.MAIN_VITE_DB_FILE_NAME;

export const initDatabase = async (): Promise<void> => {
  const dbPath = path.join(app.getPath('userData'), dbName);

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  persister = createSqlite3Persister(store, db, {
    mode: 'tabular',
    tables: {
      load: { passwords: 'passwords' },
      save: { passwords: 'passwords' }
    },
    values: {
      load: true,
      save: true,
      tableName: 'key_value_store'
    }
  });

  await persister.startAutoLoad();
  await persister.startAutoSave();
};
