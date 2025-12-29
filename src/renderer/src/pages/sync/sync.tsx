import React, { CSSProperties } from 'react';

import { BackgroundLayout } from '../../components/layout/background-layout';
import { PageHeader } from '../../components/layout/page-header';
import { LargeButton } from '@renderer/components/common/large-button';
import { useNavigate } from 'react-router-dom';

export default function SyncEntry(): React.JSX.Element {
  const navigate = useNavigate();

  const handleShareQRCode = (): void => {
    navigate('/sync/share-qr-code');
  };

  const handleScanQRCode = (): void => {
    navigate('/sync/scan-qr');
  };

  return (
    <BackgroundLayout>
      <div className="container" style={styles.pageContainer}>
        <PageHeader title="Sync" />

        <div style={styles.content}>
          <h3 className="h3" style={styles.subtitle}>
            Sync your passwords with devices around you
          </h3>

          <div style={styles.groupsWrapper}>
            <div style={styles.buttonGroup}>
              <h3 className="h3" style={styles.buttonGroupTitle}>
                Setup a sharing device
              </h3>
              <LargeButton onClick={handleShareQRCode}>Sync via QR Code</LargeButton>
            </div>

            <div style={styles.buttonGroup}>
              <h3 className="h3" style={styles.buttonGroupTitle}>
                Already have a sharing device?
              </h3>
              <LargeButton onClick={handleScanQRCode}>Scan a QR code</LargeButton>
            </div>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
}

const styles: Record<string, CSSProperties> = {
  pageContainer: {
    paddingTop: 12
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  },
  groupsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 24,
    width: '100%'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    backgroundColor: 'var(--color-white-10)',
    border: '1px solid var(--color-white-20)',
    borderRadius: 16,
    padding: 24,
    flex: 1
  },
  buttonGroupTitle: {
    minHeight: 48
  }
};
