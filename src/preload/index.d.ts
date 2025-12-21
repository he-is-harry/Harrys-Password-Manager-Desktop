import { ElectronAPI } from '@electron-toolkit/preload';
import { PasswordGeneratorOptions } from '@he-is-harry/harrys-password-manager-core-napi';

interface IHarrysPasswordManagerAPI {
  auth: {
    checkLoginCreated: () => Promise<boolean>;
    checkCompletedOnboarding: () => Promise<boolean>;
    checkBiometricAuthEnabled: () => Promise<boolean>;
    authenticateUser: (masterPassword: string) => Promise<Buffer | null>;
    completeOnboardingSave: () => Promise<void>;
    addLogin: (masterPassword: string) => Promise<void>;
  };
  passman: {
    savePassword: (name: string, password: string, vaultKey: Buffer, id?: string) => Promise<void>;
    searchPasswords: (searchText: string) => Promise<{ id: string; name: string }[]>;
    decryptPassword: (id: string, vaultKey: Buffer) => Promise<string>;
    deletePassword: (id: string) => Promise<void>;
    generatePassword: (
      options: PasswordGeneratorOptions
    ) => Promise<{ success: boolean; data?: string; error?: string }>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: IHarrysPasswordManagerAPI;
  }
}
