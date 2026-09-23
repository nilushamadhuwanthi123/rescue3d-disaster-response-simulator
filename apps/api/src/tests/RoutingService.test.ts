import { describe, it, expect } from 'vitest';
import {
  haversineDistanceMeters,
  computeRiskScore,
  estimateTravelSeconds,
  buildWaypoints,
} from '../services/RoutingService.js';

describe('haversineDistanceMeters', () => {
  it('returns 0 for the same point', () => {
    const p = { lat: 6.9271, lng: 79.8612 };
    expect(haversineDistanceMeters(p, p)).toBe(0);
  });

  it('returns a plausible distance between two known Colombo landmarks', () => {
    // Colombo Fort to Bandaranaike International Airport, ~28-31km as the crow flies.
    const fort = { lat: 6.9344, lng: 79.8428 };
    const airport = { lat: 7.1808, lng: 79.8842 };
    const distance = haversineDistanceMeters(fort, airport);
    expect(distance).toBeGreaterThan(25_000);
    expect(distance).toBeLessThan(35_000);
  });

  it('is symmetric', () => {
    const a = { lat: 6.9271, lng: 79.8612 };
    const b = { lat: 6.8, lng: 79.9 };
    expect(haversineDistanceMeters(a, b)).toBeCloseTo(haversineDistanceMeters(b, a), 6);
  });
});

describe('computeRiskScore', () => {
  it('increases monotonically with severity', () => {
    const scores = ['low', 'moderate', 'high', 'critical'].map((s) =>
      computeRiskScore(s as 'low' | 'moderate' | 'high' | 'critical'),
    );
    for (let i = 1; i < scores.length; i += 1) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });

  it('stays within [0, 1]', () => {
    for (const severity of ['low', 'moderate', 'high', 'critical'] as const) {
      const score = computeRiskScore(severity);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });
});

describe('estimateTravelSeconds', () => {
  it('increases with distance', () => {
    const low = estimateTravelSeconds(1000, 0.1);
    const high = estimateTravelSeconds(5000, 0.1);
    expect(high).toBeGreaterThan(low);
  });

  it('increases with risk at a fixed distance', () => {
    const lowRisk = estimateTravelSeconds(2000, 0.1);
    const highRisk = estimateTravelSeconds(2000, 0.9);
    expect(highRisk).toBeGreaterThan(lowRisk);
  });

  it('never returns a negative duration', () => {
    expect(estimateTravelSeconds(0, 0)).toBeGreaterThanOrEqual(0);
  });
});

describe('buildWaypoints', () => {
  it('starts at the origin and ends at the destination', () => {
    const from = { lat: 6.9, lng: 79.8 };
    const to = { lat: 7.0, lng: 79.9 };
    const waypoints = buildWaypoints(from, to, 4);
    expect(waypoints[0].z).toBeCloseTo(from.lat, 6);
    expect(waypoints[0].x).toBeCloseTo(from.lng, 6);
    expect(waypoints.at(-1)?.z).toBeCloseTo(to.lat, 6);
    expect(waypoints.at(-1)?.x).toBeCloseTo(to.lng, 6);
  });

  it('produces segments + 1 waypoints', () => {
    const waypoints = buildWaypoints({ lat: 0, lng: 0 }, { lat: 1, lng: 1 }, 6);
    expect(waypoints).toHaveLength(7);
  });

  it('gives every waypoint a unique nodeId', () => {
    const waypoints = buildWaypoints({ lat: 0, lng: 0 }, { lat: 1, lng: 1 }, 5);
    const ids = new Set(waypoints.map((w) => w.nodeId));
    expect(ids.size).toBe(waypoints.length);
  });
});
