import { useSession } from '@renderer/components/auth/auth-context';
import React, { CSSProperties, useCallback, useEffect, useRef } from 'react';
import { BackgroundLayout } from '@renderer/components/layout/background-layout';
import { PageHeader } from '@renderer/components/layout/page-header';
import { LargeButton } from '@renderer/components/common/large-button';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const QR_READER_ID = 'html5qr-reader';

export default function ScanQR(): React.JSX.Element {
  const navigate = useNavigate();
  const { vaultKey } = useSession();
  const isConnecting = useRef(false);
  // Ref to store the scanner instance so we can stop it during cleanup
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopQrScanner = async (): Promise<void> => {
    if (!html5QrCodeRef.current) return;

    if (html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
    }
    html5QrCodeRef.current.clear();
  };

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      isConnecting.current = true;
      try {
        // Stop the camera immediately after a successful scan
        await stopQrScanner();

        // Parse the QR code data
        const qrCodeInfo = JSON.parse(decodedText);
        // Connect the web socket and start syncing
        await window.api.connection.connectToSynchronizerServer(qrCodeInfo, vaultKey!);
        navigate('/sync/in-progress');
      } catch (err) {
        console.error('Failed to connect:', err);
        isConnecting.current = false;
        // TODO: show an error to the user here
      }
    },
    [navigate, vaultKey]
  );

  const handleCancel = async (): Promise<void> => {
    console.log('Handle cancel was called');
    await stopQrScanner();
    navigate(-1);
  };

  useEffect(() => {
    // Initialize the scanner
    const html5QrCode = new Html5Qrcode(QR_READER_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false
    });
    html5QrCodeRef.current = html5QrCode;
    let isMounted = true; // Track if the component is mounted

    const startScanner = async (): Promise<void> => {
      console.log('Start scanner was called');
      try {
        // Start the camera
        html5QrCode
          .start(
            { facingMode: 'environment' }, // Prefer back camera
            {
              fps: 10, // Scans per second
              aspectRatio: 1.0
            },
            (decodedText) => {
              // Success Callback
              if (!isConnecting.current) {
                handleScanSuccess(decodedText);
              }
            },
            undefined // No qr error callback, since there will likely be many frames with no QR code
          )
          .then(() => {
            // If the component unmounted while the camera was loading, stop it
            if (!isMounted) {
              console.log('Scan QR page unmounted during initialization. Stopping now.');
              html5QrCode.stop().then(() => html5QrCode.clear());
            }
          });
      } catch (err) {
        console.error('Failed to start scanner', err);
      }
    };

    startScanner();

    // Cleanup function to stop the scanner
    return () => {
      isMounted = false;
      stopQrScanner();
    };
  }, [handleScanSuccess]);

  return (
    <BackgroundLayout>
      <div className="container" style={styles.fixedContainer}>
        <PageHeader title="Scan to Sync" />

        <div style={styles.content}>
          {/* Container for the scanner */}
          <div style={styles.scannerWrapper}>
            {/* The library mounts the video inside this ID */}
            <div id={QR_READER_ID} style={styles.scannerElement} />
          </div>

          <LargeButton onClick={handleCancel}>Cancel</LargeButton>
        </div>
      </div>
    </BackgroundLayout>
  );
}

const styles: Record<string, CSSProperties> = {
  fixedContainer: {
    height: '100vh'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
    alignItems: 'center',
    flex: 1,
    minHeight: 0,
    paddingBottom: 24
  },
  scannerWrapper: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  scannerElement: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
};
