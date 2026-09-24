/**
 * Client-side validation for the auth forms.
 *
 * These rules deliberately mirror the server's zod schemas in
 * `apps/api/src/controllers/authValidation.ts`, message for message. The
 * server stays the authority — it re-validates everything and the client can
 * be bypassed entirely — but repeating the rules here means a typo is caught
 * before a round trip, and the wording matches whatever the server would have
 * said, so a field never flips between two different phrasings for the same
 * mistake.
 *
 * Every function here is pure and free of React, the DOM and the network, so
 * the rules can be unit-tested on their own rather than only through a form.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 120;

/**
 * Deliberately permissive: one @, something either side, a dot in the domain.
 * Anything stricter starts rejecting addresses that are genuinely valid, and
 * the only real proof an address works is mail arriving at it.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type LoginField = 'email' | 'password';
export type RegisterField = 'name' | 'email' | 'password';

export function validateEmail(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address';
  return undefined;
}

/** Login only checks that a password was typed — the server decides if it is right. */
export function validateLoginPassword(value: string): string | undefined {
  if (!value) return 'Password is required';
  return undefined;
}

/** Registration enforces the real rules, in the server's own words. */
export function validateNewPassword(value: string): string | undefined {
  if (!value) return 'Password is required';
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
  if (!/[0-9]/.test(value)) return 'Password must contain a number';
  return undefined;
}

export function validateName(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return 'Name is required';
  if (value.length < NAME_MIN_LENGTH) {
    return `Name must be at least ${NAME_MIN_LENGTH} characters`;
  }
  if (value.length > NAME_MAX_LENGTH) {
    return `Name must be ${NAME_MAX_LENGTH} characters or fewer`;
  }
  return undefined;
}

export function validateLoginForm(values: {
  email: string;
  password: string;
}): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};
  const email = validateEmail(values.email);
  const password = validateLoginPassword(values.password);
  if (email) errors.email = email;
  if (password) errors.password = password;
  return errors;
}

export function validateRegisterForm(values: {
  name: string;
  email: string;
  password: string;
}): FieldErrors<RegisterField> {
  const errors: FieldErrors<RegisterField> = {};
  const name = validateName(values.name);
  const email = validateEmail(values.email);
  const password = validateNewPassword(values.password);
  if (name) errors.name = name;
  if (email) errors.email = email;
  if (password) errors.password = password;
  return errors;
}

/**
 * Turns the server's `fields` array into the same shape the form already uses.
 *
 * The server reports paths like `email` or `profile.email`; only the last
 * segment names an input, and anything that does not match a field on this
 * form is dropped here so the caller can surface it as a form-level message
 * instead of attaching it to an input it does not belong to.
 */
export function mapServerFieldErrors<K extends string>(
  fields: ReadonlyArray<{ field: string; message: string }> | undefined,
  known: ReadonlyArray<K>,
): FieldErrors<K> {
  const errors: FieldErrors<K> = {};
  if (!fields) return errors;
  for (const { field, message } of fields) {
    const leaf = field.split('.').pop() as K | undefined;
    if (leaf && known.includes(leaf) && !errors[leaf]) {
      errors[leaf] = message;
    }
  }
  return errors;
}

/** The first field, in the form's own visual order, that currently has an error. */
export function firstInvalidField<K extends string>(
  errors: FieldErrors<K>,
  order: ReadonlyArray<K>,
): K | undefined {
  return order.find((field) => Boolean(errors[field]));
}
