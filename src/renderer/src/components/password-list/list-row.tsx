import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoEye,
  IoEyeOff,
  IoCopyOutline,
  IoTrashOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoCheckmark,
  IoPencil
} from 'react-icons/io5';
import { useSession } from '../auth/auth-context';
import { InvertedIconButton } from './inverted-icon-button';

interface ListRowProps {
  id: string;
  passwordName: string;
  onDelete: (id: string) => void;
}

export function ListRow({ id, passwordName, onDelete }: ListRowProps): React.JSX.Element {
  const navigate = useNavigate();
  const { vaultKey } = useSession();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const toggleUnlock = (): void => {
    setIsUnlocked((prev) => !prev);
    if (isUnlocked) {
      setDecryptedPassword(null);
    }
  };

  const handleViewToggle = async (): Promise<void> => {
    if (decryptedPassword) {
      setDecryptedPassword(null);
    } else {
      setIsDecrypting(true);
      try {
        if (vaultKey) {
          const password = await window.api.passman.decryptPassword(id, vaultKey);
          setDecryptedPassword(password);
        }
      } catch (e) {
        console.error('Failed to decrypt password', e);
      } finally {
        setIsDecrypting(false);
      }
    }
  };

  const handleCopy = async (): Promise<void> => {
    setIsCopying(true);
    try {
      let passwordToCopy = decryptedPassword;
      if (!passwordToCopy && vaultKey) {
        passwordToCopy = await window.api.passman.decryptPassword(id, vaultKey);
      }

      if (passwordToCopy) {
        await navigator.clipboard.writeText(passwordToCopy);
        setShowCopySuccess(true);
        setTimeout(() => {
          setShowCopySuccess(false);
        }, 1000);
      }
    } catch (e) {
      console.error('Failed to copy password', e);
    } finally {
      setIsCopying(false);
    }
  };

  const handleEdit = (): void => {
    navigate(`/edit-password/${id}`, {
      state: {
        initialName: passwordName // Pass the existing name here
      }
    });
  };

  return (
    <div style={{ ...styles.container, ...(isUnlocked ? styles.containerUnlocked : {}) }}>
      <div style={styles.content}>
        <span style={styles.passwordName}>{decryptedPassword || passwordName}</span>

        {isUnlocked ? (
          <div style={styles.rowActions}>
            <InvertedIconButton icon={IoPencil} onClick={handleEdit} title="Edit" />
            <InvertedIconButton
              icon={decryptedPassword ? IoEyeOff : IoEye}
              onClick={handleViewToggle}
              title={decryptedPassword ? 'Hide Password' : 'Show Password'}
              isLoading={isDecrypting}
            />
            <InvertedIconButton
              icon={showCopySuccess ? IoCheckmark : IoCopyOutline}
              onClick={handleCopy}
              title="Copy Password"
              isLoading={isCopying}
            />
            <InvertedIconButton icon={IoLockOpenOutline} onClick={toggleUnlock} title="Lock" />
            <InvertedIconButton icon={IoTrashOutline} onClick={() => onDelete(id)} title="Delete" />
          </div>
        ) : (
          <InvertedIconButton icon={IoLockClosedOutline} onClick={toggleUnlock} title="Unlock" />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: 'var(--color-white)',
    borderRadius: '16px',
    padding: '16px',
    transition: 'all 0.2s'
  },
  containerUnlocked: {
    gap: '16px'
  },
  content: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  passwordName: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: '16px',
    color: 'var(--color-black)'
  },
  rowActions: {
    display: 'flex',
    gap: '12px'
  },
  // Base icon button style for locked state (on white bg)
  iconButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: 'var(--color-pink)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.1s'
  }
};
