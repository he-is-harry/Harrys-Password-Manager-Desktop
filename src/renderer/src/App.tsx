import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { SessionProvider } from './components/auth/session-provider';
import { useSession } from './components/auth/auth-context';

import CreateMasterPassword from './pages/create-master-password';
import SignIn from './pages/sign-in';
import PasswordList from './pages/password-list';
import AddPassword from './pages/add-password';
import EditPassword from './pages/edit-password';

export default function App(): React.JSX.Element {
  return (
    <SessionProvider>
      <HashRouter>
        <RootNavigator />
      </HashRouter>
    </SessionProvider>
  );
}

function RootNavigator(): React.JSX.Element {
  const { vaultKey, hasCreatedLogin, hasCompletedOnboarding, isLoading } = useSession();

  if (isLoading) {
    return (
      <div
        style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* SCENARIO 1: Fresh Install - User needs to create a password */}
      {!hasCreatedLogin && (
        <>
          <Route path="/create-master-password" element={<CreateMasterPassword />} />
          <Route path="*" element={<Navigate to="/create-master-password" replace />} />
        </>
      )}

      {/* SCENARIO 2: Locked - User exists but needs to sign in */}
      {hasCreatedLogin && !vaultKey && (
        <>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </>
      )}

      {/* SCENARIO 3: Fully Authorized - Show the App */}
      {vaultKey && hasCompletedOnboarding && (
        <>
          <Route path="/" element={<PasswordList />} />
          <Route path="/add-password" element={<AddPassword />} />
          <Route path="/edit-password/:id" element={<EditPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}
