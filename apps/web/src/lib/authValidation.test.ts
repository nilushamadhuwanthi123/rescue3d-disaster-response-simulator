import { describe, expect, it } from 'vitest';
import {
  firstInvalidField,
  mapServerFieldErrors,
  validateEmail,
  validateLoginForm,
  validateLoginPassword,
  validateName,
  validateNewPassword,
  validateRegisterForm,
} from './authValidation';

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('   ')).toBe('Email is required');
  });

  it('rejects addresses that cannot be one', () => {
    for (const bad of ['peter', 'peter@', '@gmail.com', 'peter@gmail', 'a b@c.com']) {
      expect(validateEmail(bad)).toBe('Enter a valid email address');
    }
  });

  it('accepts ordinary addresses, including surrounding whitespace', () => {
    expect(validateEmail('peter@gmail.com')).toBeUndefined();
    expect(validateEmail('  peter@gmail.com  ')).toBeUndefined();
    expect(validateEmail('first.last+tag@sub.example.co.uk')).toBeUndefined();
  });
});

describe('validateLoginPassword', () => {
  it('only asks that something was typed — the server decides if it is right', () => {
    expect(validateLoginPassword('')).toBe('Password is required');
    expect(validateLoginPassword('a')).toBeUndefined();
  });
});

describe('validateNewPassword', () => {
  it('reports the rules in the same order every time', () => {
    expect(validateNewPassword('')).toBe('Password is required');
    expect(validateNewPassword('Ab1')).toBe('Password must be at least 8 characters');
    expect(validateNewPassword('abcdefg1')).toBe('Password must contain an uppercase letter');
    expect(validateNewPassword('Abcdefgh')).toBe('Password must contain a number');
  });

  it('accepts a password that satisfies every rule', () => {
    expect(validateNewPassword('Peter@112233')).toBeUndefined();
    expect(validateNewPassword('Abcdefg1')).toBeUndefined();
  });

  it('counts length before trimming, because spaces are legitimate password characters', () => {
    expect(validateNewPassword('Ab1     ')).toBeUndefined();
  });
});

describe('validateName', () => {
  it('requires at least two visible characters', () => {
    expect(validateName('')).toBe('Name is required');
    expect(validateName('   ')).toBe('Name is required');
    expect(validateName('P')).toBe('Name must be at least 2 characters');
    expect(validateName(' P ')).toBe('Name must be at least 2 characters');
  });

  it('accepts a real name and caps absurd ones', () => {
    expect(validateName('Peter')).toBeUndefined();
    expect(validateName('a'.repeat(120))).toBeUndefined();
    expect(validateName('a'.repeat(121))).toBe('Name must be 120 characters or fewer');
  });
});

describe('form-level validation', () => {
  it('returns no errors for valid input', () => {
    expect(validateLoginForm({ email: 'peter@gmail.com', password: 'x' })).toEqual({});
    expect(
      validateRegisterForm({ name: 'Peter', email: 'peter@gmail.com', password: 'Abcdefg1' }),
    ).toEqual({});
  });

  it('reports every bad field at once rather than one at a time', () => {
    expect(validateLoginForm({ email: 'nope', password: '' })).toEqual({
      email: 'Enter a valid email address',
      password: 'Password is required',
    });
    expect(validateRegisterForm({ name: '', email: 'nope', password: 'short' })).toEqual({
      name: 'Name is required',
      email: 'Enter a valid email address',
      password: 'Password must be at least 8 characters',
    });
  });
});

describe('mapServerFieldErrors', () => {
  it('attaches each message to the matching input', () => {
    const errors = mapServerFieldErrors(
      [{ field: 'email', message: 'Email already registered' }],
      ['email', 'password'] as const,
    );
    expect(errors).toEqual({ email: 'Email already registered' });
  });

  it('matches on the last path segment, which is the one naming an input', () => {
    const errors = mapServerFieldErrors(
      [{ field: 'body.email', message: 'Enter a valid email address' }],
      ['email'] as const,
    );
    expect(errors).toEqual({ email: 'Enter a valid email address' });
  });

  it('drops anything this form has no input for, rather than mislabelling one', () => {
    const errors = mapServerFieldErrors(
      [
        { field: '(root)', message: 'One or more fields are invalid.' },
        { field: 'role', message: 'Unsupported role' },
      ],
      ['email', 'password'] as const,
    );
    expect(errors).toEqual({});
  });

  it('keeps the first message when the server sends two for one field', () => {
    const errors = mapServerFieldErrors(
      [
        { field: 'password', message: 'Password must be at least 8 characters' },
        { field: 'password', message: 'Password must contain a number' },
      ],
      ['password'] as const,
    );
    expect(errors).toEqual({ password: 'Password must be at least 8 characters' });
  });

  it('survives a response that carried no fields at all', () => {
    expect(mapServerFieldErrors(undefined, ['email'] as const)).toEqual({});
  });
});

describe('firstInvalidField', () => {
  it('follows the form order, not the object key order, so focus lands on the topmost field', () => {
    const errors = { password: 'Password is required', email: 'Email is required' };
    expect(firstInvalidField(errors, ['email', 'password'] as const)).toBe('email');
  });

  it('returns undefined when nothing is wrong', () => {
    expect(firstInvalidField({}, ['email', 'password'] as const)).toBeUndefined();
  });
});
