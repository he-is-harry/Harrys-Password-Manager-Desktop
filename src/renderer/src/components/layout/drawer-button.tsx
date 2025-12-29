import { CSSProperties } from 'react';
import { IoMenu } from 'react-icons/io5';
import { useDrawer } from '../layout/drawer-context';

export function DrawerButton(): React.JSX.Element {
  const { isOpen, openDrawer, closeDrawer } = useDrawer();

  return (
    <button
      className={isOpen ? 'inverted-icon-button' : 'fitted-button'}
      onClick={isOpen ? closeDrawer : openDrawer}
      style={{ ...styles.drawerButton, ...(isOpen ? styles.openDrawer : {}) }}
    >
      <IoMenu size={28} color="var(--color-white)" />
    </button>
  );
}

const styles: Record<string, CSSProperties> = {
  drawerButton: {
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'var(--color-white-10)'
  },
  openDrawer: {
    backgroundColor: 'var(--color-pink)'
  }
};
