import React from 'react';
import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { AuthContext } from './auth-context';

export function SessionProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [vaultKey, setVaultKey] = useState<Buffer | null>(null);
  const [hasCreatedLogin, setHasCreatedLogin] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const wipeKey = useCallback(() => {
    if (vaultKey) {
      new Uint8Array(vaultKey).fill(0);
    }
    setVaultKey(null);
  }, [vaultKey, setVaultKey]);

  const signIn = async (masterPassword: string): Promise<void> => {
    const vaultKey = await window.api.auth.authenticateUser(masterPassword);
    setVaultKey(vaultKey);
  };

  const signUp = async (masterPassword: string): Promise<void> => {
    await window.api.auth.addLogin(masterPassword);
    await signIn(masterPassword);
    setHasCreatedLogin(true);
  };

  const signOut = useCallback(() => {
    wipeKey();
  }, [wipeKey]);

  const completeOnboarding = async (): Promise<void> => {
    await window.api.auth.completeOnboardingSave();
    setHasCompletedOnboarding(true);
  };

  // 4. Initialization Effect
  useEffect(() => {
    async function init(): Promise<void> {
      try {
        const hasCreatedLogin = await window.api.auth.checkLoginCreated();
        setHasCreatedLogin(hasCreatedLogin);

        if (hasCreatedLogin) {
          const completedOnboarding = await window.api.auth.checkCompletedOnboarding();
          setHasCompletedOnboarding(completedOnboarding);
        }
      } catch (e) {
        console.error('Initialization failed:', e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        vaultKey,
        hasCreatedLogin,
        hasCompletedOnboarding,
        completeOnboarding,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
