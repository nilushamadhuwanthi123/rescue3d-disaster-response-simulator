import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../controllers/authValidation.js';

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      name: 'Nilusha Madhuwanthi',
      email: 'nilusha@example.com',
      password: 'Password1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a password with no uppercase letter', () => {
    const result = registerSchema.safeParse({
      name: 'Nilusha',
      email: 'nilusha@example.com',
      password: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password with no number', () => {
    const result = registerSchema.safeParse({
      name: 'Nilusha',
      email: 'nilusha@example.com',
      password: 'Password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Nilusha',
      email: 'not-an-email',
      password: 'Password1',
    });
    expect(result.success).toBe(false);
  });

  it('lowercases and trims the email', () => {
    const result = registerSchema.safeParse({
      name: 'Nilusha',
      email: '  Nilusha@Example.com  ',
      password: 'Password1',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('nilusha@example.com');
    }
  });
});

describe('loginSchema', () => {
  it('accepts a valid login payload', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'anything' });
    expect(result.success).toBe(true);
  });

  it('rejects a missing password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
  });
});
