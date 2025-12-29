import React, { CSSProperties, useEffect } from 'react';
import { BackgroundLayout } from '@renderer/components/layout/background-layout';
import { LargeButton } from '@renderer/components/common/large-button';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@renderer/components/common/spinner';

export default function InProgress(): React.JSX.Element {
  const navigate = useNavigate();

  const handleCancel = async (): Promise<void> => {
    // Stop the server and go back
    await window.api.connection.stopSynchronizerConnections();
    navigate('/');
  };

  useEffect(() => {
    const unsubscribeSyncComplete = window.api.connection.onSyncComplete(() => {
      navigate('/sync/finish');
      unsubscribeSyncComplete();
    });

    return () => {
      unsubscribeSyncComplete();
    };
  }, [navigate]);

  return (
    <BackgroundLayout>
      <div className="container">
        <div className="padded-top-content">
          <h1 className="h1">Sync In Progress</h1>

          <div style={styles.centeredContent}>
            <Spinner />
            <p className="body1" style={{ textAlign: 'center' }}>
              Syncing passwords...
            </p>
          </div>

          <LargeButton onClick={handleCancel}>Cancel</LargeButton>
        </div>
      </div>
    </BackgroundLayout>
  );
}

const styles: Record<string, CSSProperties> = {
  centeredContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
};
