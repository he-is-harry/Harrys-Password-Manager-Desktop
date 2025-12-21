import { generateEncryptedVaultKey, keygen } from '@he-is-harry/harrys-password-manager-core-napi';
import {
  store,
  LOGIN_ARGON2_SALT,
  LOGIN_VAULT_KEY_CIPHERTEXT,
  LOGIN_VAULT_KEY_NONCE,
  LOGIN_COMPLETED_ONBOARDING,
  LOGIN_HAS_BIOMETRIC_AUTH
} from '../db/store';
import { KEY_TYPE, SecureStore } from '../secure-storage';
import { Buffer } from 'buffer';

// Saves that the user completed onboarding in the database
export function completeOnboardingSave(): void {
  store.setValue(LOGIN_COMPLETED_ONBOARDING, true);
}

// Adds a new login to the database
export function addLogin(masterPassword: string): void {
  const masterPasswordBytes = new TextEncoder().encode(masterPassword);

  const encrypted = generateEncryptedVaultKey(masterPasswordBytes);
  const keyPair = keygen();

  SecureStore.saveKey(KEY_TYPE.ENCRYPTION_KEY, keyPair.encryptionKey);
  SecureStore.saveKey(KEY_TYPE.DECRYPTION_KEY, keyPair.decryptionKey);

  store.setValues({
    [LOGIN_ARGON2_SALT]: Buffer.from(encrypted.argon2Salt).toString('base64'),
    [LOGIN_VAULT_KEY_CIPHERTEXT]: Buffer.from(encrypted.vaultKeyCiphertext).toString('base64'),
    [LOGIN_VAULT_KEY_NONCE]: Buffer.from(encrypted.vaultKeyNonce).toString('base64'),
    [LOGIN_COMPLETED_ONBOARDING]: false,
    [LOGIN_HAS_BIOMETRIC_AUTH]: false
  });
}
