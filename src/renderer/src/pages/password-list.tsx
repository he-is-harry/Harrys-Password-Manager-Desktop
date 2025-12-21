import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { IoSearch } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import { useSession } from '../components/auth/auth-context';
import { BackgroundLayout } from '../components/background-layout';
import { HomeHeader } from '../components/password-list/home-header';
import { ListRow } from '../components/password-list/list-row';

interface PasswordRow {
  id: string;
  name: string;
}

export default function PasswordList(): React.JSX.Element {
  const { signOut } = useSession();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [passwords, setPasswords] = useState<PasswordRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPasswords = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const results = await window.api.passman.searchPasswords(searchQuery);
      setPasswords(results);
    } catch (e) {
      console.error('Failed to fetch passwords', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this password?')) {
      try {
        await window.api.passman.deletePassword(id);
        fetchPasswords();
      } catch (e) {
        console.error('Failed to delete password', e);
      }
    }
  };

  const handleAdd = (): void => {
    navigate('/add-password');
  };

  return (
    <BackgroundLayout>
      <div className="container">
        <HomeHeader onAdd={handleAdd} onSignOut={signOut} />

        <div className="searchContainer">
          <IoSearch size={20} color="var(--color-white-60)" />
          <input
            type="text"
            className="searchInput"
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.passwordList}>
          {loading && (
            <div style={styles.emptyState}>
              <span style={styles.emptyStateText}>Loading...</span>
            </div>
          )}

          {!loading &&
            passwords.map((password) => (
              <ListRow
                key={password.id}
                id={password.id}
                passwordName={password.name}
                onDelete={handleDelete}
              />
            ))}

          {!loading && passwords.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyStateText}>No passwords found</span>
            </div>
          )}
        </div>
      </div>
    </BackgroundLayout>
  );
}

const styles: Record<string, CSSProperties> = {
  passwordList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingBottom: '24px'
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '48px'
  },
  emptyStateText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    color: 'var(--color-white-60)'
  }
};
