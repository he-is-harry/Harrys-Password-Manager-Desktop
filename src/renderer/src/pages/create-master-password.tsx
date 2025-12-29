import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSession } from '../components/auth/auth-context';
import { BackgroundLayout } from '../components/layout/background-layout';
import { PasswordInput } from '../components/common/password-input';
import { LargeButton } from '../components/common/large-button';

export default function CreateMasterPassword(): React.JSX.Element {
  const { signUp, completeOnboarding } = useSession();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (): Promise<void> => {
    if (!password) return;
    setLoading(true);
    try {
      await signUp(password);
      await completeOnboarding();
      navigate('/');
    } catch (e) {
      console.error(e);
      // Handle error (e.g. show alert)
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <div className="container">
        <div className="padded-top-content">
          <h1 className="h1">Create Master Password</h1>

          <p className="body1" style={{ textAlign: 'center' }}>
            This password will be used to sign in and encrypt your other passwords. Do not lose it!
          </p>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Master Password"
          />

          <LargeButton onClick={handleCreate} loading={loading}>
            Create Account
          </LargeButton>
        </div>
      </div>
    </BackgroundLayout>
  );
}
