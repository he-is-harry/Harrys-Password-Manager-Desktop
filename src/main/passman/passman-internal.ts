import {
  EncryptedPassword,
  decryptPassword as coreDecryptPassword
} from '@he-is-harry/harrys-password-manager-core-napi';
import { store } from '../db/store';

type PasswordRow = ReturnType<typeof store.getRow<'passwords'>>;

export function decryptPasswordInternal(
  row: PasswordRow,
  vaultKey: Buffer,
  deviceDecryptionKey: Buffer<ArrayBuffer>
): string {
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

  // Decrypt the password using Harry's Password Manager Core.
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
