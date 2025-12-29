import { useSession } from '@renderer/components/auth/auth-context';
import React, { CSSProperties, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { BackgroundLayout } from '@renderer/components/layout/background-layout';
import { PageHeader } from '@renderer/components/layout/page-header';
import { LargeButton } from '@renderer/components/common/large-button';
import { useNavigate } from 'react-router-dom';

export default function ShareQRCode(): React.JSX.Element {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const { vaultKey } = useSession();

  const handleCancel = async (): Promise<void> => {
    await window.api.connection.stopSynchronizerConnections();
    navigate(-1);
  };

  useEffect(() => {
    const generateQR = async (): Promise<void> => {
      try {
        const connectionInfo = await window.api.connection.startSynchronizerServer(vaultKey!);

        const qrData = JSON.stringify({
          ip: connectionInfo.ip,
          port: connectionInfo.port,
          secretKey: connectionInfo.secretKey
        });

        // Draw connection info in QR code
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, qrData, {
            errorCorrectionLevel: 'H',
            width: 400,
            margin: 2
          });
        }
      } catch (err) {
        console.error('Failed to generate QR', err);
      }
    };

    generateQR();

    const unsubscribeDeviceConnected = window.api.connection.onDeviceConnected(() => {
      navigate('/sync/in-progress');
      unsubscribeDeviceConnected();
    });

    return () => {
      unsubscribeDeviceConnected();
    };
  }, [vaultKey, navigate]);

  return (
    <BackgroundLayout>
      <div className="container">
        <PageHeader title="Scan to Sync" />

        <div style={styles.content}>
          <canvas ref={canvasRef} />
          <LargeButton onClick={handleCancel}>Cancel</LargeButton>
        </div>
      </div>
    </BackgroundLayout>
  );
}

const styles: Record<string, CSSProperties> = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
    alignItems: 'center',
    paddingTop: 16
  }
};
