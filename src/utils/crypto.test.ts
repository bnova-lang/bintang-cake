import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './crypto';
import { SEED_CUSTOMERS, SEED_ADMIN_USERS } from '../data/seed/initialData';

describe('crypto utilities', () => {
  it('hashes password and verifies successfully with PBKDF2', async () => {
    const password = 'rahasia-bintang-demo';
    const { hash, salt } = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 hex is 64 chars

    const isValid = await verifyPassword(password, hash, salt);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword('password-salah', hash, salt);
    expect(isInvalid).toBe(false);
  });

  it('verifies seed passwords match exact hashes', async () => {
    const custSalt = 'b2c3d4e5f60718293a4b5c6d7e8f90a1';
    const custHash = 'cda39081988f52e677232bf8239c33c5903f13e5a376f351473238e441a3768a';
    const isCustValid = await verifyPassword('pelanggan-demo', custHash, custSalt);
    expect(isCustValid).toBe(true);

    const adminSalt = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
    const adminHash = '270a15a30867697d6c8a6bc3fedde35f9f491343ae590906fbebf4451ee38a4d';
    const isAdminValid = await verifyPassword('admin-bintang-demo', adminHash, adminSalt);
    expect(isAdminValid).toBe(true);
  });
});
