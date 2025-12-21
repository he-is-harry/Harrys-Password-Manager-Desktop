import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { PasswordGeneratorOptions } from '@he-is-harry/harrys-password-manager-core-napi';

// Create the implementation
const api = {
  auth: {
    checkLoginCreated: () => ipcRenderer.invoke('auth:check-login-created'),
    checkCompletedOnboarding: () => ipcRenderer.invoke('auth:check-onboarding'),
    checkBiometricAuthEnabled: () => ipcRenderer.invoke('auth:check-biometric'),
    authenticateUser: (masterPassword: string) =>
      ipcRenderer.invoke('auth:authenticate-user', masterPassword),
    completeOnboardingSave: () => ipcRenderer.invoke('auth:complete-onboarding-save'),
    addLogin: (masterPassword: string) => ipcRenderer.invoke('auth:add-login', masterPassword)
  },
  passman: {
    savePassword: (name: string, password: string, vaultKey: Buffer, id?: string) =>
      ipcRenderer.invoke('passman:save-password', name, password, vaultKey, id),
    searchPasswords: (searchText: string) =>
      ipcRenderer.invoke('passman:search-passwords', searchText),
    decryptPassword: (id: string, vaultKey: Buffer) =>
      ipcRenderer.invoke('passman:decrypt-password', id, vaultKey),
    deletePassword: (id: string) => ipcRenderer.invoke('passman:delete-password', id),
    generatePassword: (options: PasswordGeneratorOptions) =>
      ipcRenderer.invoke('passman:generate-password', options)
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // Fallback for non-isolated contexts
  // @ts-ignore (defined in dts)
  window.electron = electronAPI;
  // @ts-ignore (defined in dts)
  window.api = api;
}
