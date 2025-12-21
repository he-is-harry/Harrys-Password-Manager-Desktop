import { ipcMain } from 'electron';
import { checkLoginCreated, checkCompletedOnboarding, checkBiometricAuthEnabled } from './checks';
import { authenticateUser } from './authentication';
import { addLogin, completeOnboardingSave } from './storage';

export function setupAuthHandlers(): void {
  ipcMain.handle('auth:check-login-created', () => {
    return checkLoginCreated();
  });

  ipcMain.handle('auth:check-onboarding', () => {
    return checkCompletedOnboarding();
  });

  ipcMain.handle('auth:check-biometric', () => {
    return checkBiometricAuthEnabled();
  });

  ipcMain.handle('auth:authenticate-user', (_event, masterPassword: string) => {
    return authenticateUser(masterPassword);
  });

  ipcMain.handle('auth:complete-onboarding-save', () => {
    completeOnboardingSave();
  });

  ipcMain.handle('auth:add-login', (_event, masterPassword: string) => {
    addLogin(masterPassword);
  });
}
