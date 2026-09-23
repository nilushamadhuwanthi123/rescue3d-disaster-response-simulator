import { describe, it, expect } from 'vitest';
import { createIncidentSchema, updateIncidentStatusSchema } from '../controllers/incidentValidation.js';

describe('createIncidentSchema', () => {
  const valid = {
    title: 'Warehouse fire on 4th St',
    description: 'Large structure fire, multiple units requested, smoke visible from highway.',
    type: 'fire' as const,
    severity: 'high' as const,
    location: { lat: 6.9271, lng: 79.8612 },
  };

  it('accepts a valid incident payload', () => {
    expect(createIncidentSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an out-of-range latitude', () => {
    const result = createIncidentSchema.safeParse({ ...valid, location: { lat: 200, lng: 0 } });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown incident type', () => {
    const result = createIncidentSchema.safeParse({ ...valid, type: 'meteor' });
    expect(result.success).toBe(false);
  });

  it('rejects a description that is too short', () => {
    const result = createIncidentSchema.safeParse({ ...valid, description: 'fire' });
    expect(result.success).toBe(false);
  });
});

describe('updateIncidentStatusSchema', () => {
  it('accepts a known status', () => {
    expect(updateIncidentStatusSchema.safeParse({ status: 'dispatched' }).success).toBe(true);
  });

  it('rejects an unknown status', () => {
    expect(updateIncidentStatusSchema.safeParse({ status: 'exploded' }).success).toBe(false);
  });
});
