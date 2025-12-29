import os from 'os';
import {
  createCustomSynchronizer,
  Receive,
  Synchronizer
} from 'tinybase/synchronizers/with-schemas';
import { MergeableStore } from 'tinybase/with-schemas';
import { Message } from 'tinybase/synchronizers/with-schemas';
import { Schemas, store } from '../db/store';
import {
  decryptNetworkPacket,
  encryptNetworkPacket,
  generateNetworkSharedSecretKey
} from '@he-is-harry/harrys-password-manager-core-napi';
import { Server as TcpServer, Socket as TcpSocket } from 'net';
import { createSyncStore, encryptSyncStore } from '../db/sync-store';
import { ipcMain } from 'electron';

export function getLocalIPAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const interfaceList of Object.values(interfaces)) {
    if (!interfaceList) continue;
    for (const iface of interfaceList) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  throw new Error('No IP address found');
}

// The data included in Tinybase's synchronize functionality
interface TinybaseSynchronizePacket {
  toClientId: string | null;
  requestId: string | null;
  message: Message;
  body: unknown;
}

export function createSecureTcpSynchronizer(
  store: MergeableStore<Schemas>,
  socket: TcpSocket,
  sharedSecretKey: Buffer
): Synchronizer<Schemas> {
  const handleSend = (
    toClientId: string | null,
    requestId: string | null,
    message: Message,
    body: unknown
  ): void => {
    try {
      const packet: TinybaseSynchronizePacket = { toClientId, requestId, message, body };
      const encryptedData = encryptNetworkPacket(JSON.stringify(packet), sharedSecretKey);

      // Length-prefix framing: 4-byte length header (big-endian) + encrypted data
      const header = Buffer.alloc(4);
      header.writeUInt32BE(encryptedData.length, 0);

      if (!socket.destroyed && socket.writable) {
        socket.write(header);
        socket.write(encryptedData);
      } else {
        console.warn('Sync: Socket closed/not-writable, packet dropped', requestId);
      }
    } catch (err) {
      console.error('Sync: Encryption or Send failed', err);
    }
  };

  const handleRegisterReceive = (receive: Receive): void => {
    let receiveBuffer = Buffer.alloc(0);

    const onSocketData = (data: Buffer): void => {
      try {
        // Append new data to receive buffer
        receiveBuffer = Buffer.concat([receiveBuffer, data]);

        // Process all complete messages in the buffer
        while (receiveBuffer.length >= 4) {
          // Read the length header (4 bytes, big-endian)
          const messageLength = receiveBuffer.readUInt32BE(0);

          // Check if we have the complete message
          if (receiveBuffer.length >= 4 + messageLength) {
            // Extract the message
            const encryptedData = receiveBuffer.subarray(4, 4 + messageLength);

            // Remove processed message from buffer
            receiveBuffer = receiveBuffer.subarray(4 + messageLength);

            // Decrypt and parse the message
            const jsonString = decryptNetworkPacket(encryptedData, sharedSecretKey);
            const packet: TinybaseSynchronizePacket = JSON.parse(jsonString);
            receive(
              packet.toClientId ?? 'peer',
              packet.requestId ?? '',
              packet.message,
              packet.body
            );
          } else {
            // Not enough data yet, wait for more
            break;
          }
        }
      } catch (err) {
        console.error('Sync: Receive failed (Decrypt or Parse error)', err);
        // Clear buffer on error to prevent corruption
        receiveBuffer = Buffer.alloc(0);
      }
    };

    socket.on('data', onSocketData);
  };

  const handleDestroy = (): void => {
    if (!socket.destroyed) {
      socket.destroy();
    }
  };

  return createCustomSynchronizer(store, handleSend, handleRegisterReceive, handleDestroy, 5);
}

let synchronizer: Synchronizer<Schemas> | null = null;
let tcpServer: TcpServer | null = null;
let tcpSocket: TcpSocket | null = null;
let currentSharedKey: Buffer | null = null;

function handleSyncCompletion(
  synchronizer: Synchronizer<Schemas>,
  socket: TcpSocket,
  onComplete: () => void
): void {
  let localFinished = false;
  let remoteFinished = false;

  const checkDone = (): void => {
    if (localFinished && remoteFinished) {
      onComplete();
    }
  };

  // Handle local completion
  synchronizer.startSync().then(() => {
    const markLocalFinished = (): void => {
      if (!localFinished) {
        localFinished = true;
        // Signal to peer that we are done sending
        if (!socket.destroyed && socket.writable) {
          socket.end();
        }
        checkDone();
      }
    };

    // Wait until the synchronizer is idle for 1000ms
    let timerId: NodeJS.Timeout | undefined = undefined;
    const statusListenerId = synchronizer.addStatusListener((_persister, status) => {
      if (status === 0) {
        // Status.Idle === 0
        timerId = setTimeout(() => {
          synchronizer.delListener(statusListenerId);
          markLocalFinished();
        }, 1000);
      } else {
        clearTimeout(timerId);
      }
    });
  });

  // Handle remote completion
  socket.on('end', () => {
    remoteFinished = true;
    checkDone();
  });
}

export interface QRCodeInfo {
  ip: string;
  port: number;
  secretKey: string;
}

export async function startSynchronizerServer(
  vaultKey: Buffer,
  sender: Electron.WebContents
): Promise<QRCodeInfo> {
  // If server is already running, return existing info
  if (tcpServer && currentSharedKey) {
    const address = tcpServer.address();
    return {
      ip: getLocalIPAddress(),
      port: typeof address === 'object' && address !== null ? address.port : 0,
      secretKey: currentSharedKey.toString('base64')
    };
  }

  // Generate shared secret key
  currentSharedKey = generateNetworkSharedSecretKey();

  // Create TCP server
  tcpServer = new TcpServer((clientSocket: TcpSocket) => {
    // Notify renderer that a device connected
    sender.send('connection:device-connected');

    // Setup temporary sync store
    const syncStore = createSyncStore(vaultKey);

    // Setup secure synchronizer
    const synchronizer = createSecureTcpSynchronizer(syncStore, clientSocket, currentSharedKey!);

    // Start syncing, on completion, completeSync is called with the filled syncStore
    handleSyncCompletion(synchronizer, clientSocket, () => {
      completeSync(syncStore, vaultKey);
      sender.send('connection:sync-complete');
    });

    clientSocket.on('close', async () => {
      console.log('Device disconnected'); // TODO: Remove console log
      await synchronizer.destroy();
      // syncStore is garbage collected here
    });

    clientSocket.on('error', (err) => console.error('Socket error:', err));
  });

  // Listen on port 0 to get a random available port
  await new Promise<void>((resolve) => {
    tcpServer!.listen(0, () => {
      console.log('TCP Synchronizer server started');
      resolve();
    });
  });

  const address = tcpServer!.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;

  return {
    ip: getLocalIPAddress(),
    port,
    secretKey: currentSharedKey!.toString('base64')
  };
}

export async function connectToSynchronizerServer(
  qrCodeInfo: QRCodeInfo,
  vaultKey: Buffer,
  sender: Electron.WebContents
): Promise<void> {
  // Decode the shared secret key from base64
  const sharedSecretKey = Buffer.from(qrCodeInfo.secretKey, 'base64');

  // Create the TCP socket
  tcpSocket = new TcpSocket();

  // Wait for connection to open
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      tcpSocket?.destroy();
      reject(new Error('TCP connection timeout'));
    }, 10000); // 10 second timeout

    // Attempt connection
    tcpSocket!.connect(qrCodeInfo.port, qrCodeInfo.ip, () => {
      clearTimeout(timeout);
      resolve();
    });

    tcpSocket!.once('error', (error: Error) => {
      clearTimeout(timeout);
      reject(new Error('TCP connection failed: ' + error.message));
    });
  });

  // Create the sync store
  const syncStore = createSyncStore(vaultKey);
  synchronizer = createSecureTcpSynchronizer(syncStore, tcpSocket, sharedSecretKey);

  // Start syncing, on completion, completeSync is called with the filled syncStore
  handleSyncCompletion(synchronizer, tcpSocket, async () => {
    await completeSync(syncStore, vaultKey);
    // Send the event to the renderer process
    sender.send('connection:sync-complete');
  });

  // Setup error handling
  tcpSocket.on('error', (err: Error) => {
    console.error('Sync: Socket error:', err);
  });

  tcpSocket.on('close', () => {
    console.log('Sync: Connection closed');
  });
}

async function completeSync(syncStore: MergeableStore<Schemas>, vaultKey: Buffer): Promise<void> {
  // Re-encrypt the passwords with this device's encryption key
  await encryptSyncStore(syncStore, vaultKey);

  store.merge(syncStore);
}

export function stopSynchronizerConnections(): void {
  if (tcpServer) {
    tcpServer.close();
    tcpServer = null;
  }
  if (synchronizer) {
    synchronizer.destroy();
    synchronizer = null;
  }
  if (tcpSocket) {
    tcpSocket.destroy();
    tcpSocket = null;
  }
  currentSharedKey = null;
}

export function setupConnectionHandlers(): void {
  ipcMain.handle('connection:start-synchronizer-server', (event, vaultKey: Buffer) => {
    return startSynchronizerServer(vaultKey, event.sender);
  });

  ipcMain.handle(
    'connection:connect-to-synchronizer-server',
    (event, qrCodeInfo: QRCodeInfo, vaultKey: Buffer) => {
      connectToSynchronizerServer(qrCodeInfo, vaultKey, event.sender);
    }
  );

  ipcMain.handle('connection:stop-synchronizer-connections', () => {
    stopSynchronizerConnections();
  });
}
