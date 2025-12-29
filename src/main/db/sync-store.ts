import { createMergeableStore, MergeableStore } from 'tinybase/with-schemas';
import { Schemas, store, TABLES, VALUES } from './store';
import { decryptPasswordInternal } from '../passman/passman-internal';
import { KEY_TYPE, SecureStore } from '../secure-storage';
import { encryptPassword } from '@he-is-harry/harrys-password-manager-core-napi';

const ROW_STRIP_FIELDS = [
  'argon2Salt',
  'hkdfSalt',
  'kemNonce',
  'kemCiphertext',
  'passwordNonce'
] as const;

const ENCRYPTED_ROW_FIELDS = [...ROW_STRIP_FIELDS, 'passwordCiphertext'] as const;

export function createSyncStore(vaultKey: Buffer): MergeableStore<Schemas> {
  // Obtain the device decryption key
  const deviceDecryptionKey = SecureStore.getKey(KEY_TYPE.DECRYPTION_KEY);
  if (!deviceDecryptionKey) {
    throw new Error('Decryption key not found');
  }

  // Create sync store that has the decrypted passwords and stripped out values
  const syncStore = createMergeableStore().setTablesSchema(TABLES).setValuesSchema(VALUES);

  const [mergeableTables] = store.getMergeableContent();
  const tablesMap = mergeableTables[0];

  for (const tableStamp of Object.values(tablesMap)) {
    const rowMap = tableStamp[0];

    for (const rowStamp of Object.values(rowMap)) {
      const row = rowStamp[0];
      if (row.passwordCiphertext != null && row.passwordCiphertext[0] != null) {
        // Remove metadata so that the row can be handled properly in decryptPasswordInternal
        const rawRow = {
          argon2Salt: row.argon2Salt?.[0],
          hkdfSalt: row.hkdfSalt?.[0],
          kemNonce: row.kemNonce?.[0],
          kemCiphertext: row.kemCiphertext?.[0],
          passwordNonce: row.passwordNonce?.[0],
          passwordCiphertext: row.passwordCiphertext?.[0]
        };

        // Decrypt password
        const password = decryptPasswordInternal(rawRow, vaultKey, deviceDecryptionKey);

        // Strip out salts and ciphertexts
        for (const field of ROW_STRIP_FIELDS) {
          if (row[field]) {
            row[field][0] = ''; // Remove value
            row[field][1] = ''; // Remove hash of value
          }
        }

        // Set password ciphertext to decrypted password
        if (row.passwordCiphertext) {
          row.passwordCiphertext[0] = password;
          row.passwordCiphertext[1] = '';
        }
      }
    }
  }

  // Only set the tables in the mergable content, the values are empty and will not be merged
  syncStore.setMergeableContent([mergeableTables, [{}, '', 0]]);

  return syncStore;
}

export async function encryptSyncStore(
  syncStore: MergeableStore<Schemas>,
  vaultKey: Buffer
): Promise<MergeableStore<Schemas>> {
  // Obtain the device encryption key
  const deviceEncryptionKey = SecureStore.getKey(KEY_TYPE.ENCRYPTION_KEY);
  if (!deviceEncryptionKey) {
    throw new Error('Encryption key not found');
  }

  const [mergeableTables] = syncStore.getMergeableContent();
  const tablesMap = mergeableTables[0];

  for (const tableStamp of Object.values(tablesMap)) {
    const rowMap = tableStamp[0];

    for (const rowStamp of Object.values(rowMap)) {
      const row = rowStamp[0];

      if (row.passwordCiphertext != null && row.passwordCiphertext[0] != null) {
        const plaintextPassword = row.passwordCiphertext[0];

        const passwordBytes = new TextEncoder().encode(plaintextPassword);
        const encryptedData = encryptPassword(vaultKey, deviceEncryptionKey, passwordBytes);

        // Add back encrypted data
        for (const field of ENCRYPTED_ROW_FIELDS) {
          if (row[field]) {
            const rawValue = encryptedData[field];
            const base64Value = Buffer.from(rawValue).toString('base64');

            // Update the value (index 0) and leave the hash (index 1) empty/as-is
            row[field][0] = base64Value;
          }
        }
      }
    }
  }

  // Update the store with the re-encrypted passwords table
  syncStore.setMergeableContent([mergeableTables, [{}, '', 0]]);

  return syncStore;
}
