// Web Crypto API PBKDF2 Password Hashing (SECURITY.md §4)

/**
 * Hash a password using Web Crypto PBKDF2 with SHA-256
 */
export async function hashPassword(password: string, existingSalt?: string): Promise<{ hash: string; salt: string }> {
  const enc = new TextEncoder();
  const saltBytes = existingSalt
    ? hexToBytes(existingSalt)
    : crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );

  const exported = await crypto.subtle.exportKey('raw', derivedKey);
  const hashHex = bytesToHex(new Uint8Array(exported));
  const saltHex = bytesToHex(saltBytes);

  return { hash: hashHex, salt: saltHex };
}

/**
 * Verify password against stored hash and salt with constant-time comparison
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return constantTimeCompare(hash, storedHash);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
