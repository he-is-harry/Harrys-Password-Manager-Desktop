import { CSSProperties } from 'react';
import { IoLogOutOutline } from 'react-icons/io5';

interface HomeHeaderProps {
  onAdd: () => void;
  onSignOut: () => void;
}

export function HomeHeader({ onAdd, onSignOut }: HomeHeaderProps): React.JSX.Element {
  return (
    <div style={styles.container}>
      <h2 className="h2" style={styles.heading}>
        Harry&apos;s Password Manager
      </h2>
      <div style={styles.actions}>
        <button className="fitted-button" onClick={onAdd}>
          <span style={{ color: 'var(--color-pink)' }}>+ Add</span>
        </button>
        <button
          className="fitted-button"
          style={{ paddingBlock: '8px' }}
          onClick={onSignOut}
          title="Sign Out"
        >
          <IoLogOutOutline size={27} color="var(--color-pink)" />
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  heading: {
    fontSize: '24px',
    margin: 0
  },
  actions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  }
};
