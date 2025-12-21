import {
  EncryptedPassword,
  encryptPassword,
  decryptPassword as coreDecryptPassword,
  generatePassword as coreGeneratePassword,
  PasswordGeneratorOptions
} from '@he-is-harry/harrys-password-manager-core-napi';
import { store, queries } from './db/store';
import { KEY_TYPE, SecureStore } from './secure-storage';
import { ipcMain } from 'electron';

export function savePassword(name: string, password: string, vaultKey: Buffer, id?: string): void {
  // 1. Obtain the encryption key
  const deviceEncryptionKey = SecureStore.getKey(KEY_TYPE.ENCRYPTION_KEY);
  if (!deviceEncryptionKey) {
    throw new Error('Encryption key not found');
  }

  // 2. Encrypt the password using Harry's Password Manager Core.
  const passwordBytes = new TextEncoder().encode(password);
  const encryptedPassword = encryptPassword(vaultKey, deviceEncryptionKey, passwordBytes);

  // 3. Store that encrypted password into Tinybase
  const rowData = {
    name: name,
    argon2Salt: Buffer.from(encryptedPassword.argon2Salt).toString('base64'),
    hkdfSalt: Buffer.from(encryptedPassword.hkdfSalt).toString('base64'),
    kemCiphertext: Buffer.from(encryptedPassword.kemCiphertext).toString('base64'),
    kemNonce: Buffer.from(encryptedPassword.kemNonce).toString('base64'),
    passwordCiphertext: Buffer.from(encryptedPassword.passwordCiphertext).toString('base64'),
    passwordNonce: Buffer.from(encryptedPassword.passwordNonce).toString('base64'),
    updatedAt: new Date().toISOString()
  };

  if (id) {
    store.setRow('passwords', id, rowData);
  } else {
    store.addRow('passwords', rowData);
  }
}

interface PasswordRow {
  id: string;
  name: string;
}

export function searchPasswords(searchText: string): PasswordRow[] {
  queries.setQueryDefinition('searchPasswords', 'passwords', ({ select, where }) => {
    select('name');
    where((getCell) => {
      const name = getCell('name');
      return typeof name === 'string' && name.toLowerCase().includes(searchText.toLowerCase());
    });
  });

  const result = queries.getResultTable('searchPasswords');
  return Object.entries(result).map(([id, row]) => ({
    id: id,
    name: row.name as string
  }));
}

export async function decryptPassword(id: string, vaultKey: Buffer): Promise<string> {
  const row = store.getRow('passwords', id);
  if (!row) {
    throw new Error('Password not found');
  }

  if (
    row.argon2Salt === undefined ||
    row.hkdfSalt === undefined ||
    row.kemCiphertext === undefined ||
    row.kemNonce === undefined ||
    row.passwordCiphertext === undefined ||
    row.passwordNonce === undefined
  ) {
    throw new Error('Malformed password row');
  }

  // 1. Obtain the encryption key
  const deviceDecryptionKey = SecureStore.getKey(KEY_TYPE.DECRYPTION_KEY);
  if (!deviceDecryptionKey) {
    throw new Error('Decryption key not found');
  }

  // 2. Decrypt the password using Harry's Password Manager Core.
  const argon2Salt = Buffer.from(row.argon2Salt, 'base64');
  const hkdfSalt = Buffer.from(row.hkdfSalt, 'base64');
  const kemCiphertext = Buffer.from(row.kemCiphertext, 'base64');
  const kemNonce = Buffer.from(row.kemNonce, 'base64');
  const passwordCiphertext = Buffer.from(row.passwordCiphertext, 'base64');
  const passwordNonce = Buffer.from(row.passwordNonce, 'base64');
  const encryptedPassword = new EncryptedPassword(
    argon2Salt,
    hkdfSalt,
    kemNonce,
    kemCiphertext,
    passwordNonce,
    passwordCiphertext
  );

  const decryptedPasswordBytes = coreDecryptPassword(
    vaultKey,
    deviceDecryptionKey,
    encryptedPassword
  );

  return new TextDecoder().decode(decryptedPasswordBytes);
}

export function deletePassword(id: string): void {
  store.delRow('passwords', id);
}

export function generatePassword(options: PasswordGeneratorOptions): {
  success: boolean;
  data?: string;
  error?: string;
} {
  try {
    const password = coreGeneratePassword(options);
    return { success: true, data: password };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export function setupPassmanHandlers(): void {
  ipcMain.handle(
    'passman:save-password',
    (_event, name: string, password: string, vaultKey: Buffer, id?: string) => {
      savePassword(name, password, vaultKey, id);
    }
  );

  ipcMain.handle('passman:search-passwords', (_event, searchText: string) => {
    return searchPasswords(searchText);
  });

  ipcMain.handle('passman:decrypt-password', (_event, id: string, vaultKey: Buffer) => {
    return decryptPassword(id, vaultKey);
  });

  ipcMain.handle('passman:delete-password', (_event, id: string) => {
    deletePassword(id);
  });

  ipcMain.handle('passman:generate-password', (_event, options: PasswordGeneratorOptions) => {
    return generatePassword(options);
  });
}
