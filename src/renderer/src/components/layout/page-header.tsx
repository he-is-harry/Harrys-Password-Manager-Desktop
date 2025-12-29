import { CSSProperties } from 'react';
import { DrawerButton } from '../layout/drawer-button';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps): React.JSX.Element {
  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <DrawerButton />
        <h2 className="h2" style={styles.heading}>
          {title}
        </h2>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  heading: {
    fontSize: '24px',
    margin: 0
  }
};
