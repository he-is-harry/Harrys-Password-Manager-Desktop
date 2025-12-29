import { app } from 'electron';
import path from 'path';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { createQueries, createMergeableStore } from 'tinybase/with-schemas';
import { createCustomSqlitePersister, Persister, Persists } from 'tinybase/persisters/with-schemas';

export const TABLES = {
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

export const VALUES = {
  [LOGIN_ARGON2_SALT]: { type: 'string' },
  [LOGIN_VAULT_KEY_CIPHERTEXT]: { type: 'string' },
  [LOGIN_VAULT_KEY_NONCE]: { type: 'string' },
  [LOGIN_COMPLETED_ONBOARDING]: { type: 'boolean', default: false },
  [LOGIN_HAS_BIOMETRIC_AUTH]: { type: 'boolean', default: false }
} as const;

export type Schemas = [typeof TABLES, typeof VALUES];

export const store = createMergeableStore().setTablesSchema(TABLES).setValuesSchema(VALUES);
export const queries = createQueries(store);

// Define references for persistence (to prevent Garbage Collection)
// We export them in case other files need direct access later
export let db: DatabaseType;
export let persister: Persister<Schemas, Persists.StoreOrMergeableStore>;

const dbName = import.meta.env.MAIN_VITE_DB_FILE_NAME;

export const initDatabase = async (): Promise<void> => {
  const dbPath = path.join(app.getPath('userData'), dbName);

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  persister = createCustomSqlitePersister(
    store,
    // Arg 2: Configuration
    {
      mode: 'json'
    },
    // Arg 3: executeCommand
    async (sql: string, params: unknown[] = []) => {
      try {
        // TinyBase uses "$n" syntax, but better-sqlite3 expects "?" for array parameters.
        // We replace all occurrences of $number with ?
        const sanitizedSql = sql.replace(/\$\d+/g, '?');
        const stmt = db.prepare(sanitizedSql);
        // better-sqlite3 specifically requires .all() for SELECT and .run() for INSERT/UPDATE
        if (stmt.reader) {
          return stmt.all(params) as { [field: string]: unknown }[];
        } else {
          stmt.run(params);
          return []; // sqlite3.all returns [] on writes, so we match that
        }
      } catch (e) {
        console.error('SQL Error:', e);
        throw e;
      }
    },
    // Arg 4: addChangeListener
    // better-sqlite3 doesn't support "on change" listeners for tables
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_listener) => null,
    // Arg 5: delChangeListener
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_listenerHandle) => {
      /* no-op */
    },
    // Arg 6: onSqlCommand
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_sql, _params) => {
      // Add logging here
      // console.log('SQL:', sql, params);
    },
    // Arg 7: onIgnoredError
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error) => {
      // Add logging here
      // console.error('TinyBase Persistence Error:', error);
    },
    // Arg 8: destroy
    () => {
      db.close();
    },
    // Arg 9: persist
    // 1 = Store, 2 = MergeableStore, 3 = Both
    3,
    // Arg 10: thing (The underlying DB instance)
    db
  );

  // Since better-sqlite3 does not support "on change" listeners, auto load likely will not work
  // for continous updates, we do this to only load once at the start. However, since the store is
  // only updated from the main process, we already know of all changes.
  await persister.startAutoLoad();
  // Auto save will still work
  await persister.startAutoSave();
};
