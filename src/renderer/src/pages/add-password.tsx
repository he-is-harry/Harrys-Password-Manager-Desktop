import { useSession } from '@renderer/components/auth/auth-context';
import { BackgroundLayout } from '@renderer/components/background-layout';
import { PasswordForm } from '@renderer/components/password-form/password-form';
import { CSSProperties } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

export default function AddPassword(): React.JSX.Element {
  const { vaultKey } = useSession();
  const navigate = useNavigate();

  const handleAddPassword = async (name: string, password: string): Promise<void> => {
    await window.api.passman.savePassword(name, password, vaultKey!);
    navigate(-1);
  };

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
            <h1 className="h1">Add Password</h1>
            <div style={styles.headerSpacer} />
          </div>
          <PasswordForm submitButtonText="Save Password" onSubmit={handleAddPassword} />
        </div>
      </div>
    </BackgroundLayout>
  );
}

const styles: Record<string, CSSProperties> = {
  header: {
    display: 'flex',
    flexDirection: 'row',
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
  scrollContainer: {
    height: '100vh',
    overflowY: 'auto'
  }
};
