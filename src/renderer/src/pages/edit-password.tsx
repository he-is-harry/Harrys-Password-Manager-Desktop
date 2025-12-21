import { useSession } from '@renderer/components/auth/auth-context';
import { BackgroundLayout } from '@renderer/components/background-layout';
import { Spinner } from '@renderer/components/common/spinner';
import { PasswordForm } from '@renderer/components/password-form/password-form';
import React, { CSSProperties, useEffect, useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function EditPassword(): React.JSX.Element {
  const { vaultKey } = useSession();
  const navigate = useNavigate();
  // Get the ID from the URL params
  const { id } = useParams<{ id: string }>();
  // Access the invisible state passed from the previous screen
  const location = useLocation();
  const initialName = location.state?.initialName;

  const [initialPassword, setInitialPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate(-1);
      return;
    }

    const loadPassword = async (): Promise<void> => {
      try {
        const decrypted = await window.api.passman.decryptPassword(id, vaultKey!);
        setInitialPassword(decrypted);
      } catch (e) {
        console.error('Failed to load password', e);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadPassword();
  }, [id, vaultKey, navigate]);

  const handleUpdatePassword = async (name: string, password: string): Promise<void> => {
    if (!id) return;
    await window.api.passman.savePassword(name, password, vaultKey!, id);
    navigate(-1);
  };

  // 4. Loading State (Replaces ActivityIndicator)
  if (loading) {
    return (
      <BackgroundLayout>
        <div style={styles.loadingContainer}>
          <Spinner />
        </div>
      </BackgroundLayout>
    );
  }

  return (
    <BackgroundLayout>
      <div style={styles.scrollContainer}>
        <div className="container">
          <div style={styles.header}>
            <button
              onClick={() => navigate(-1)}
              style={styles.backButton}
              type="button"
              title="Go Back"
            >
              <IoArrowBack size={24} color="var(--color-white)" />
            </button>
            <h1 className="h1">Edit Password</h1>
            <div style={styles.headerSpacer} />
          </div>

          <PasswordForm
            initialName={initialName}
            initialPassword={initialPassword}
            submitButtonText="Update Password"
            onSubmit={handleUpdatePassword}
          />
        </div>
      </div>
    </BackgroundLayout>
  );
}

const styles: Record<string, CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 12
  },
  backButton: {
    padding: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  headerSpacer: {
    width: 24
  },
  loadingContainer: {
    display: 'flex',
    flex: 1,
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContainer: {
    height: '100vh',
    overflowY: 'auto'
  }
};
