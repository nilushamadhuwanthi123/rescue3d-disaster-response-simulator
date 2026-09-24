# Nilusha's Scope & Ownership — Rescue3D

**Role:** Full-Stack Product, Incident Intelligence and Emergency Response Lead  
**Lead:** Nilusha Madhuwanthi Jayasekara ([@nilushamadhuwanthi123](https://github.com/nilushamadhuwanthi123))  
**Document version:** 1.0 (Based on Rescue3D Team Role Guide & Merged Branches)

---

## 1. Overview & Ownership

Nilusha leads the incident intelligence, response workflows, operation dashboard, route calculation engine, backend APIs, data validation and database models.

| Area | Nilusha Owns | Kavindu Owns |
|---|---|---|
| **Incident Management** | Reporting, lifecycle states, severity classification, impacted radius & road blockages | Disaster visual rendering (fire/flood/earthquake) |
| **Response & Resources** | Unit availability, assignment workflows, operation timeline, status tracking | Vehicle 3D models, visual placement & animation |
| **Route Calculation** | Simulated safe-route engine, waypoint generation, explainable risk score & ETA | Visual route rendering, waypoint traversal |
| **Backend & Data** | Express REST APIs, MongoDB/Mongoose models, Zod validation, JWT authentication | Server deployment configuration (Render/Atlas), CI monitoring |
| **Frontend Applications** | Incident Command Center UI, Analytics Dashboard, Timeline Replay, Design System | 3D Interactive City Canvas & scene adapters |

---

## 2. Core Functional Deliverables

### 01 Authentication & Operator Access
- JWT access tokens with secure refresh token rotation and cookie/header support.
- User roles (`administrator`, `coordinator`, `operator`, `analyst`, `viewer`) and permission-based route guards, matching the `UserRole` union in `packages/contracts/src/auth.ts`.
- Secure password hashing with `bcryptjs` and Zod schema validation.

### 02 Incident Command Center
- Incident reporting interface supporting multiple incident types (`fire`, `flood`, `earthquake`, `medical`, `hazmat`, `structural`).
- Status lifecycle tracking (`reported` → `dispatched` → `in_progress` → `contained` → `resolved`).
- Real-time unit assignment and resource status tracking (`available`, `dispatched`, `on_scene`, `returning`, `out_of_service`).
- Operator-facing cards with live distance, ETA, and risk indicators.

### 03 Deterministic Simulated Routing Engine
- Haversine distance calculation and pure routing logic.
- Severity-driven risk scoring in `[0, 1]` with documented formula weights.
- Travel time estimation that scales inversely with road risk and conditions.
- Straight-line waypoint interpolation providing `{ nodeId, x, y, z }` coordinates for the 3D scene.
- Endpoint `GET /api/assignments/:id/route` returning the standardized `SceneRoute` contract.

### 04 Analytics, Replay & Reports
- Key performance metrics: Average response time, containment rate, resource utilization.
- Incident history and step-by-step incident timeline audit trail.
- Post-incident operations reporting.

### 05 Real-Time Synchronization & Quality
- Socket.IO server and client hooks (`useRealtimeIncidents`) for instant cross-operator updates without manual page reloads.
- Unit and integration test coverage across all domain services and controllers.
- Automated API error handling with standardized JSON response envelopes.

---

## 3. Integration Seam with Kavindu's 3D Scene

Nilusha provides the application state and API endpoints consumed by Kavindu's 3D scene adapter:
- **Incident Data:** Incident positions, type, severity, and status changes.
- **Unit Data:** Assigned units, vehicle types, and current positions.
- **Route Data:** Ordered waypoints, distance, and estimated duration.
- **Scene Action Callbacks:** Handlers for `onLocationSelect` (to open report modal or inspect details), `onUnitSelect` (to open unit dispatch panel), and `onAnimationComplete` (to trigger on-scene operational status).
