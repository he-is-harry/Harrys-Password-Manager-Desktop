import React, { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoSyncOutline, IoLogOutOutline } from 'react-icons/io5';
import { useDrawer } from './drawer-context';
import { useSession } from '../auth/auth-context';

export function NavigationDrawer(): React.JSX.Element {
  const { isOpen, closeDrawer } = useDrawer();
  const { signOut } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  const handleSignOut = (): void => {
    signOut();
    closeDrawer();
  };

  // If not open, we don't render anything
  if (!isOpen) return <></>;

  return (
    <div style={styles.drawer}>
      <div style={styles.navItems}>
        <button
          style={{
            ...styles.navItem,
            ...(location.pathname === '/' ? styles.activeNavItem : styles.inactiveNavItem)
          }}
          onClick={() => handleNavigation('/')}
        >
          <IoHomeOutline size={20} />
          <span>Home</span>
        </button>

        <button
          style={{
            ...styles.navItem,
            ...(location.pathname.startsWith('/sync')
              ? styles.activeNavItem
              : styles.inactiveNavItem)
          }}
          onClick={() => handleNavigation('/sync')}
        >
          <IoSyncOutline size={20} />
          <span>Sync</span>
        </button>
      </div>

      <div style={styles.footer}>
        <button style={{ ...styles.navItem, ...styles.signOutButton }} onClick={handleSignOut}>
          <IoLogOutOutline size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  drawer: {
    width: '250px',
    backgroundColor: 'var(--color-white-10)',
    border: '1px solid var(--color-white-20)',
    borderRightColor: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    paddingBlock: 16,
    paddingInline: 8,
    height: '100%',
    boxSizing: 'border-box',
    position: 'relative'
  },
  navItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--color-white)', // Black text
    fontSize: '16px',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  },
  activeNavItem: {
    backgroundColor: 'var(--color-white-50)', // Light pink background
    color: 'var(--color-pink)', // Pink text
    border: 'none'
  },
  inactiveNavItem: {
    background: 'none',
    border: 'none'
  },
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid #e0e0e0',
    paddingTop: 16,
    marginInline: 8
  },
  signOutButton: {
    paddingInline: 8,
    border: 'none',
    backgroundColor: 'transparent'
  }
};
