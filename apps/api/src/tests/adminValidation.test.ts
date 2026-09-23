import { describe, it, expect } from 'vitest';
import { updateUserRoleSchema } from '../controllers/adminValidation.js';

describe('updateUserRoleSchema', () => {
  it('accepts a known role', () => {
    expect(updateUserRoleSchema.safeParse({ role: 'coordinator' }).success).toBe(true);
  });

  it('rejects an unknown role', () => {
    expect(updateUserRoleSchema.safeParse({ role: 'superuser' }).success).toBe(false);
  });

  it('rejects a missing role', () => {
    expect(updateUserRoleSchema.safeParse({}).success).toBe(false);
  });
});
