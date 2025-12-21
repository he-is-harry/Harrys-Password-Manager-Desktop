import { useState } from 'react';

import { useSession } from '../components/auth/auth-context';
import { BackgroundLayout } from '../components/background-layout';
import { PasswordInput } from '../components/common/password-input';
import { InputError } from '../components/common/input-error';
import { LargeButton } from '../components/common/large-button';
import { useNavigate } from 'react-router-dom';

export default function SignIn(): React.JSX.Element {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = (): void => {
    setLoading(true);
    setError(null);
    try {
      signIn(password);
      navigate('/');
    } catch {
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <div className="container">
        <div className="padded-top-content">
          <h1 className="h1">Sign In</h1>

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Master Password"
          />
          <InputError error={error} />

          <LargeButton onClick={handleSignIn} loading={loading}>
            Sign In
          </LargeButton>
        </div>
      </div>
    </BackgroundLayout>
  );
}
