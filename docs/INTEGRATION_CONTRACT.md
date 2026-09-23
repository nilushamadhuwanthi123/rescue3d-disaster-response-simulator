# Frontend/3D Integration Contract

This is the seam between Nilusha's incident/routing backend and Kavindu's
3D disaster-visualization scene. Both sides depend only on the types in
`packages/contracts/src/scene.ts` (plus `incident.ts` for the incident and
unit shapes) — neither side should import from the other's app code.

## What the backend guarantees

`GET /api/assignments/:id/route` returns a `SceneRoute`:

```ts
interface SceneRoute {
  assignmentId: string;
  unitId: string;
  incidentId: string;
  status: 'ready' | 'active' | 'rerouting' | 'arrived' | 'unavailable';
  waypoints: SceneWaypoint[]; // { nodeId, x, y, z }
  distanceMeters: number;
  estimatedSeconds: number;
  riskScore: number; // 0..1, see RoutingService.computeRiskScore
  avoidedRoadIds: string[];
}
```

- `waypoints` is ordered from the unit's current position to the
  incident's position. The scene is free to interpolate/animate between
  consecutive waypoints however it likes; the backend does not assume
  anything about frame rate or camera behavior.
- `x`/`z` are longitude/latitude-derived plane coordinates; `y` is
  reserved for elevation and is currently always `0` (no terrain data
  yet). If the 3D scene needs a different coordinate convention, that's a
  conversion the scene layer owns — the contract stays lat/lng-based on
  the backend side.
- `status` mirrors the assignment's lifecycle: `ready` (assigned, not yet
  moving), `active` (en route), `arrived` (on scene), `unavailable`
  (released or the assignment/unit/incident no longer exists).
  `rerouting` is reserved for a future branch (dynamic re-routing) and is
  never emitted yet.
- **Everything under `packages/contracts/src/scene.ts` is simulated.**
  `estimatedSeconds` and `riskScore` come from a documented, inspectable
  formula (`apps/api/src/services/RoutingService.ts`), not a real traffic
  or road-network model. Any UI built on top of this must keep Rescue3D's
  simulation disclaimer visible — see `SIMULATION_DISCLAIMER` in
  `packages/contracts/src/auth.ts`.

## What the 3D scene owns

- Rendering the waypoints as a path, camera movement, unit models,
  incident markers, terrain/environment — all scene-side concerns the
  backend has no opinion on.
- Polling or subscribing to route updates. Branch 3 only adds the
  request/response endpoint above; live push updates (sockets) are a
  later branch's scope and will be documented here when they land.

## Change process

Either side can propose a change to a shared type, but it goes through a
PR that both of us review — this file and `packages/contracts` are the
one seam where a silent change breaks the other person's code without
either of us noticing until runtime.
