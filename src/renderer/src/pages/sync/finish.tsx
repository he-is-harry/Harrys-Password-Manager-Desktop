import React, { CSSProperties } from 'react';
import { BackgroundLayout } from '@renderer/components/layout/background-layout';
import { LargeButton } from '@renderer/components/common/large-button';
import { useNavigate } from 'react-router-dom';
import { IoCheckmarkDone } from 'react-icons/io5';

export default function Finish(): React.JSX.Element {
  const navigate = useNavigate();

  const handleFinish = async (): Promise<void> => {
    // Stop the server and go back
    await window.api.connection.stopSynchronizerConnections();
    navigate('/');
  };

  return (
    <BackgroundLayout>
      <div className="container">
        <div className="padded-top-content">
          <h1 className="h1">Sync Complete</h1>

          <div style={styles.centeredContent}>
            <IoCheckmarkDone size={64} color="var(--color-white)" />
            <p className="body1" style={{ textAlign: 'center' }}>
              Your passwords have been synchronized.
            </p>
          </div>

          <LargeButton onClick={handleFinish}>Done</LargeButton>
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
