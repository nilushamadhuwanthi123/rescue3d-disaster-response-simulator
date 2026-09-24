# Frontend / 3D Integration Contract

This document defines the formal contract between Nilusha's incident intelligence & routing backend and Kavindu's 3D disaster-visualization scene. Both sides depend only on the types in `packages/contracts/src/scene.ts` (plus `incident.ts` for incident and unit shapes) — neither side should import from the other's application code.

---

## 1. Shared Integration Contract Shapes

| Contract Item | TypeScript Type / Shape | Responsibility |
|---|---|---|
| **City Location** | `CityLocation`: `{ locationId, type, displayName, scenePosition: {x, y, z}, roadNodeId }` | Defined in reproducible city configuration. Scene positions map to road node IDs. |
| **Incident Snapshot** | `SceneIncidentSnapshot`: `{ id, type, severity, locationId, status, affectedLocationIds, blockedRoadIds }` | Backend provides state; 3D scene visualizes localized disaster effects. |
| **Unit Snapshot** | `SceneUnitSnapshot`: `{ id, kind, status, facilityLocationId, currentLocation?, roadNodeId? }` | Backend tracks unit status; 3D scene renders 3D vehicle model and movement. |
| **Route Result** | `SceneRoute`: `{ assignmentId, unitId, incidentId, status, waypoints, distanceMeters, estimatedSeconds, riskScore, avoidedRoadIds, noRouteReason? }` | Nilusha calculates simulated safe path; Kavindu renders path and animates unit. |
| **Scene Actions** | `SceneActions`: `onLocationSelect(locationId)`, `onUnitSelect(unitId)`, `onAnimationComplete(assignmentId)` | 3D scene captures user interactions; application handles state transitions. |

---

## 2. What the Backend Guarantees

`GET /api/assignments/:id/route` returns a `SceneRoute`:

```ts
export interface SceneRoute {
  assignmentId: string;
  unitId: string;
  incidentId: string;
  status: 'ready' | 'active' | 'rerouting' | 'arrived' | 'unavailable';
  waypoints: SceneWaypoint[]; // { nodeId, x, y, z }
  distanceMeters: number;
  estimatedSeconds: number;
  riskScore: number; // 0..1, see RoutingService.computeRiskScore
  avoidedRoadIds: string[];
  noRouteReason?: string;
}
```

- **Ordered Waypoints:** `waypoints` is ordered from the unit's starting coordinates to the incident location. The scene interpolates/animates between consecutive waypoints along the road network.
- **Coordinates:** `x`/`z` are plane coordinates mapping to the city grid; `y` is reserved for elevation (default `0`).
- **Status Lifecycle:** `ready` (assigned, preparing departure), `active` (en route along waypoints), `arrived` (reached incident location), `unavailable` (route blocked or assignment released).
- **Educational Simulation Notice:** Everything under `packages/contracts/src/scene.ts` is simulated. Travel time and risk scores are derived from deterministic formulas (`RoutingService.ts`), not real emergency navigation data.

---

## 3. What the 3D Scene Owns

- **City Visualization:** Rendering roads, intersections, facilities (Hospital, Fire Station, Rescue Station) and buildings.
- **Disaster Visuals:**
  - Fire: Localized flames, smoke particles, affected radius indicator.
  - Flood: Rising water overlay, blocked road indicators.
  - Earthquake: Camera shake, building structural damage indicators.
- **Emergency Vehicles:** 3D models for fire truck, ambulance, and rescue team; animating units along the supplied waypoints.
- **Scene Quality & Performance:** Responsive WebGL canvas, orbit/pan/zoom camera controls, reset-view button, low-motion fallback mode, and resource cleanup on scenario switch.

---

## 4. Integration Checkpoints

- **Checkpoint 1:** A static city with stable IDs and a mock incident payload.
- **Checkpoint 2:** Incident status drives fire visuals and an assigned vehicle follows supplied waypoints.
- **Checkpoint 3:** All three disasters and the deployed build use the real API, with a repeatable demo scenario.

---

## 5. Change Process

Either side can propose a change to a shared type, but it goes through a Pull Request that both teammates review. `packages/contracts` and this document represent the seam where changes must remain backward-compatible and explicitly coordinated.
