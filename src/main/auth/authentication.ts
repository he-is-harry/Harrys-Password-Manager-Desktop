import {
  LOGIN_ARGON2_SALT,
  LOGIN_VAULT_KEY_CIPHERTEXT,
  LOGIN_VAULT_KEY_NONCE,
  store
} from '../db/store';

import { decryptVaultKey, EncryptedVaultKey } from '@he-is-harry/harrys-password-manager-core-napi';

export function authenticateUser(masterPassword: string): Buffer {
  if (!store.hasValue(LOGIN_VAULT_KEY_CIPHERTEXT)) {
    throw new Error('User not found');
  }

  const {
    [LOGIN_ARGON2_SALT]: loginArgon2Salt,
    [LOGIN_VAULT_KEY_CIPHERTEXT]: loginVaultKeyCiphertext,
    [LOGIN_VAULT_KEY_NONCE]: loginVaultKeyNonce
  } = store.getValues();

  if (!loginArgon2Salt || !loginVaultKeyCiphertext || !loginVaultKeyNonce) {
    throw new Error('Corrupt login data');
  }

  const masterPasswordBytes = new TextEncoder().encode(masterPassword);

  const argon2SaltBuffer = Buffer.from(loginArgon2Salt, 'base64');
  const vaultKeyCiphertextBuffer = Buffer.from(loginVaultKeyCiphertext, 'base64');
  const vaultKeyNonceBuffer = Buffer.from(loginVaultKeyNonce, 'base64');

  const vaultKey = decryptVaultKey(
    masterPasswordBytes,
    new EncryptedVaultKey(argon2SaltBuffer, vaultKeyCiphertextBuffer, vaultKeyNonceBuffer)
  );

  masterPasswordBytes.fill(0);

  return vaultKey;
}
