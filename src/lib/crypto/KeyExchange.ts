export class KeyExchange {
  private keyPair: CryptoKeyPair | null = null;

  async init(): Promise<void> {
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      ['deriveKey', 'deriveBits']
    );
  }

  async getPublicKey(): Promise<ArrayBuffer> {
    if (!this.keyPair) {
      throw new Error('KeyExchange not initialized');
    }
    return await window.crypto.subtle.exportKey('raw', this.keyPair.publicKey);
  }

  async deriveSharedKey(peerPublicKeyBuffer: ArrayBuffer): Promise<CryptoKey> {
    if (!this.keyPair) {
      throw new Error('KeyExchange not initialized');
    }

    const peerPublicKey = await window.crypto.subtle.importKey(
      'raw',
      peerPublicKeyBuffer,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      []
    );

    const sharedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'ECDH',
        public: peerPublicKey,
      },
      this.keyPair.privateKey,
      256
    );

    return await window.crypto.subtle.importKey(
      'raw',
      sharedBits,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
}