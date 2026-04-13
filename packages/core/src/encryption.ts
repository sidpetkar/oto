import { x25519 } from "@noble/curves/ed25519";
import { gcm } from "@noble/ciphers/aes";
import { randomBytes } from "@noble/ciphers/webcrypto";

export interface KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export function generateKeyPair(): KeyPair {
  const privateKey = randomBytes(32);
  const publicKey = x25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

export function deriveSharedSecret(
  privateKey: Uint8Array,
  peerPublicKey: Uint8Array
): Uint8Array {
  return x25519.getSharedSecret(privateKey, peerPublicKey);
}

export function encryptChunk(
  data: Uint8Array,
  sharedSecret: Uint8Array
): { encrypted: Uint8Array; iv: Uint8Array } {
  const iv = randomBytes(12);
  const aes = gcm(sharedSecret, iv);
  const encrypted = aes.encrypt(data);
  return { encrypted, iv };
}

export function decryptChunk(
  encrypted: Uint8Array,
  sharedSecret: Uint8Array,
  iv: Uint8Array
): Uint8Array {
  const aes = gcm(sharedSecret, iv);
  return aes.decrypt(encrypted);
}
