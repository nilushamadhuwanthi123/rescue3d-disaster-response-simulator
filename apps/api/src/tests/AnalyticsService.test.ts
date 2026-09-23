import { describe, it, expect } from 'vitest';
import type { Incident, ResponseUnit } from '@rescue3d/contracts';
import {
  incidentsByStatus,
  incidentsBySeverity,
  incidentsByType,
  unitsByStatus,
  unitUtilizationPercent,
  averageDispatchSeconds,
} from '../services/AnalyticsService.js';

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: overrides.id ?? 'incident-1',
    title: 'Test incident',
    description: 'A test incident.',
    type: 'fire',
    severity: 'moderate',
    status: 'reported',
    location: { lat: 0, lng: 0 },
    reportedBy: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeUnit(overrides: Partial<ResponseUnit> = {}): ResponseUnit {
  return {
    id: overrides.id ?? 'unit-1',
    name: 'Engine 1',
    type: 'fire_engine',
    status: 'available',
    location: { lat: 0, lng: 0 },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('incidentsByStatus', () => {
  it('counts every known status, defaulting unseen ones to zero', () => {
    const counts = incidentsByStatus([
      makeIncident({ status: 'reported' }),
      makeIncident({ status: 'reported' }),
      makeIncident({ status: 'resolved' }),
    ]);
    expect(counts.reported).toBe(2);
    expect(counts.resolved).toBe(1);
    expect(counts.dispatched).toBe(0);
  });
});

describe('incidentsBySeverity', () => {
  it('counts by severity', () => {
    const counts = incidentsBySeverity([
      makeIncident({ severity: 'critical' }),
      makeIncident({ severity: 'critical' }),
      makeIncident({ severity: 'low' }),
    ]);
    expect(counts.critical).toBe(2);
    expect(counts.low).toBe(1);
    expect(counts.high).toBe(0);
  });
});

describe('incidentsByType', () => {
  it('only includes types that actually occurred', () => {
    const counts = incidentsByType([makeIncident({ type: 'flood' })]);
    expect(counts.flood).toBe(1);
    expect(counts.fire).toBeUndefined();
  });
});

describe('unitsByStatus', () => {
  it('counts by status', () => {
    const counts = unitsByStatus([
      makeUnit({ status: 'available' }),
      makeUnit({ status: 'dispatched' }),
    ]);
    expect(counts.available).toBe(1);
    expect(counts.dispatched).toBe(1);
    expect(counts.on_scene).toBe(0);
  });
});

describe('unitUtilizationPercent', () => {
  it('returns 0 for an empty fleet', () => {
    expect(unitUtilizationPercent([])).toBe(0);
  });

  it('counts dispatched and on_scene as active', () => {
    const units = [
      makeUnit({ status: 'dispatched' }),
      makeUnit({ status: 'on_scene' }),
      makeUnit({ status: 'available' }),
      makeUnit({ status: 'available' }),
    ];
    expect(unitUtilizationPercent(units)).toBe(50);
  });

  it('rounds to the nearest whole percent', () => {
    const units = [makeUnit({ status: 'dispatched' }), makeUnit(), makeUnit()];
    expect(unitUtilizationPercent(units)).toBe(33);
  });
});

describe('averageDispatchSeconds', () => {
  it('returns null when no incident has been assigned yet', () => {
    const result = averageDispatchSeconds([makeIncident({ id: 'a' })], new Map());
    expect(result).toBeNull();
  });

  it('averages the gap between report time and first assignment', () => {
    const incidents = [
      makeIncident({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeIncident({ id: 'b', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    const firstAssignedAt = new Map([
      ['a', '2026-01-01T00:01:00.000Z'], // 60s
      ['b', '2026-01-01T00:02:00.000Z'], // 120s
    ]);
    expect(averageDispatchSeconds(incidents, firstAssignedAt)).toBe(90);
  });

  it('excludes incidents that have no assignment yet rather than treating them as zero', () => {
    const incidents = [
      makeIncident({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeIncident({ id: 'b', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    const firstAssignedAt = new Map([['a', '2026-01-01T00:01:00.000Z']]);
    expect(averageDispatchSeconds(incidents, firstAssignedAt)).toBe(60);
  });
});
