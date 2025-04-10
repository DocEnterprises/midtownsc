import { v4 as uuidv4 } from 'uuid';

class SignalProtocolManager {
  private sessionId: string;
  private keyPair: CryptoKeyPair | null = null;

  constructor(userId: string = uuidv4()) {
    this.sessionId = userId;
  }

  async init() {
    try {
      // Generate ECDH key pair for secure key exchange
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        true,
        ['deriveKey', 'deriveBits']
      );

      // Generate a random registration ID
      const registrationIdBuffer = new Uint32Array(1);
      crypto.getRandomValues(registrationIdBuffer);
      const registrationId = registrationIdBuffer[0];

      // Export public key for sharing
      const exportedPublicKey = await window.crypto.subtle.exportKey(
        'raw',
        this.keyPair.publicKey
      );

      return {
        publicKey: new Uint8Array(exportedPublicKey),
        registrationId,
      };
    } catch (error) {
      console.error('Error initializing Signal Protocol:', error);
      throw new Error('Failed to initialize secure messaging');
    }
  }

  async encryptMessage(message: string): Promise<ArrayBuffer> {
    try {
      if (!this.keyPair) {
        throw new Error('Protocol not initialized');
      }

      // Generate a random key for AES-GCM
      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the message
      const encodedMessage = new TextEncoder().encode(message);
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encodedMessage
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      return combined.buffer;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  async decryptMessage(encryptedData: ArrayBuffer): Promise<string> {
    try {
      if (!this.keyPair) {
        throw new Error('Protocol not initialized');
      }

      // Extract IV and encrypted data
      const combined = new Uint8Array(encryptedData);
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      // Generate the same key using ECDH
      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Decrypt the message
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        data
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const createSignalProtocolManager = (userId?: string) => {
  return new SignalProtocolManager(userId);
};