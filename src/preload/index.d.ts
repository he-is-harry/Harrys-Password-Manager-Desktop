import { ElectronAPI } from '@electron-toolkit/preload';
import { PasswordGeneratorOptions } from '@he-is-harry/harrys-password-manager-core-napi';
import { QRCodeInfo } from '../main/sync/connection';

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
  connection: {
    startSynchronizerServer: (vaultKey: Buffer) => Promise<QRCodeInfo>;
    connectToSynchronizerServer: (qrCodeInfo: QRCodeInfo, vaultKey: Buffer) => Promise<void>;
    stopSynchronizerConnections: () => Promise<void>;
    // Returns an unsubscribe function to remove the device connected listener
    onDeviceConnected: (callback: () => void) => () => void;
    onSyncComplete: (callback: () => void) => () => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: IHarrysPasswordManagerAPI;
  }
}
