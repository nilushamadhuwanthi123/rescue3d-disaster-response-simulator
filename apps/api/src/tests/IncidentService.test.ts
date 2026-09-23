import { describe, it, expect } from 'vitest';
import { isValidTransition } from '../services/IncidentService.js';

describe('incident status transitions', () => {
  it('allows the full forward path', () => {
    expect(isValidTransition('reported', 'dispatched')).toBe(true);
    expect(isValidTransition('dispatched', 'in_progress')).toBe(true);
    expect(isValidTransition('in_progress', 'contained')).toBe(true);
    expect(isValidTransition('contained', 'resolved')).toBe(true);
  });

  it('rejects skipping a step', () => {
    expect(isValidTransition('reported', 'resolved')).toBe(false);
    expect(isValidTransition('reported', 'in_progress')).toBe(false);
  });

  it('rejects moving backwards', () => {
    expect(isValidTransition('in_progress', 'dispatched')).toBe(false);
    expect(isValidTransition('resolved', 'contained')).toBe(false);
  });

  it('treats resolved as a terminal state', () => {
    expect(isValidTransition('resolved', 'reported')).toBe(false);
    expect(isValidTransition('resolved', 'dispatched')).toBe(false);
  });

  it('rejects a no-op transition to the same status', () => {
    expect(isValidTransition('dispatched', 'dispatched')).toBe(false);
  });
});
