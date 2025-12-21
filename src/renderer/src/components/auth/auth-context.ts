import { createContext, use } from 'react';

interface AuthContextType {
  signIn: (masterPassword: string) => void;
  signUp: (masterPassword: string) => Promise<void>;
  signOut: () => void;
  vaultKey: Buffer | null;
  hasCreatedLogin: boolean;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  signIn: () => {},
  signUp: async () => {},
  signOut: () => null,
  vaultKey: null,
  hasCreatedLogin: false,
  hasCompletedOnboarding: false,
  completeOnboarding: async () => {},
  isLoading: true
});

// Use this hook to access the user info.
export function useSession(): AuthContextType {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}
