import { describe, it, expect } from 'vitest';
import { canChangeRole } from '../services/AdminUserService.js';

describe('canChangeRole', () => {
  it('allows promoting a non-administrator to administrator', () => {
    expect(canChangeRole('viewer', 'administrator', 0)).toBe(true);
  });

  it('allows changing a non-administrator to any other non-admin role', () => {
    expect(canChangeRole('viewer', 'analyst', 0)).toBe(true);
  });

  it('allows demoting an administrator when other administrators exist', () => {
    expect(canChangeRole('administrator', 'viewer', 1)).toBe(true);
  });

  it('refuses to demote the last remaining administrator', () => {
    expect(canChangeRole('administrator', 'viewer', 0)).toBe(false);
  });

  it('allows an administrator to keep the administrator role', () => {
    expect(canChangeRole('administrator', 'administrator', 0)).toBe(true);
  });
});
