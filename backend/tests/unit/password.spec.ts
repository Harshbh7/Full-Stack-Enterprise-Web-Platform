import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, hashToken } from '../../src/utils/password.util.js';

describe('Argon2id Password & Token Hashing Utility Unit Tests', () => {
  it('PWD-01: generates a valid Argon2id hash for plaintext password', async () => {
    const plain = 'StrongPass123!@#';
    const hash = await hashPassword(plain);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('PWD-02: verifies valid plaintext password against its Argon2id hash', async () => {
    const plain = 'AcademicPass2026';
    const hash = await hashPassword(plain);
    const isValid = await verifyPassword(hash, plain);

    expect(isValid).toBe(true);
  });

  it('PWD-03: rejects incorrect password against hash', async () => {
    const plain = 'ValidPassword123';
    const wrong = 'WrongPassword456';
    const hash = await hashPassword(plain);
    const isValid = await verifyPassword(hash, wrong);

    expect(isValid).toBe(false);
  });

  it('PWD-04: hashToken produces consistent SHA-256 digest for refresh token storage', () => {
    const token = 'sample_refresh_token_uuid_45678';
    const digest1 = hashToken(token);
    const digest2 = hashToken(token);

    expect(digest1).toBe(digest2);
    expect(digest1.length).toBe(64); // 256 bits = 64 hex characters
  });
});

