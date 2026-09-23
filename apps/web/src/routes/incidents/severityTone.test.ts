import { describe, it, expect } from 'vitest';
import { severityTone } from './severityTone';

describe('severityTone', () => {
  it('maps critical and high severities to danger', () => {
    expect(severityTone('critical')).toBe('danger');
    expect(severityTone('high')).toBe('danger');
  });

  it('maps moderate severity to warning', () => {
    expect(severityTone('moderate')).toBe('warning');
  });

  it('maps low severity to neutral', () => {
    expect(severityTone('low')).toBe('neutral');
  });
});
