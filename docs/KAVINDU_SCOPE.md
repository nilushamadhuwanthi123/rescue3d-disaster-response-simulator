# Kavindu's Scope & Ownership — Rescue3D

**Role:** 3D Simulation, Disaster Visualization and DevOps Lead  
**Lead:** Kavindu Madhuhansa Liyanage ([@kavindu-maduhansa](https://github.com/kavindu-maduhansa))  
**Document version:** 1.0 (Based on Rescue3D Team Role Guide, 22 September 2026)

---

## 1. The Shared Goal

Build a browser-based disaster response simulator where a user selects a location, starts a fire, flood or earthquake scenario, dispatches an emergency unit, sees its route and reviews the operation in a dashboard.

> **Simulation Disclaimer:** Rescue3D is an educational simulation, not a real emergency navigation tool. Routes, risk scores, resource recommendations and response times are simulated and must not be used for real emergency decisions.

---

## 2. Ownership Boundary

| Area | Kavindu Owns | Nilusha Owns |
|---|---|---|
| **3D Experience** | City layout, assets, camera, disaster effects, vehicle models and animations | Object selection, incident panels, status overlays and dashboard interaction |
| **Response** | Visual placement and movement of vehicles; draw a supplied route | Unit availability, assignment, operation status and route calculation |
| **Platform** | Development environments, CI, deployment, service health and monitoring | API behavior, authentication, data validation, MongoDB models and reports |
| **Integration** | Implement scene adapters; test the full demo with Nilusha | Define and implement API / response data; test the full demo with Kavindu |

### The Clear Boundary
The backend is the source of truth for incidents, units and operation history. The 3D scene renders the current state and sends user actions to the application layer. Visual effects must never silently change saved incident or unit state.

---

## 3. 3D and Simulation Deliverables

### 01 Interactive City Foundation
- Create a coherent city with roads, intersections, buildings, a hospital, a fire station and a rescue station.
- Give every selectable location and road node a stable ID.
- Add orbit / pan / zoom with useful limits, a reset-view control, lighting and labels.
- Provide a city configuration file (`cityConfig.json`) so positions and road connections are reproducible.
- Expose click and hover events to the application through documented callbacks (`onLocationSelect`, `onUnitSelect`). Nilusha connects those events to incident creation and information panels.

### 02 Disaster Visuals
- **Fire:** Localized flames / smoke, a clear affected radius and severity levels.
- **Flood:** A rising water overlay and visibly blocked or affected roads.
- **Earthquake:** Short controlled camera shake and damaged-building visual indicators.
- Visual effects must respond to incident type, location, severity and lifecycle status supplied by application state.
- Include a low-motion option and a reduced-quality mode for slower devices.
- Keep the scene legible: color, symbols and text labels should convey status even when effects are paused.

### 03 Emergency Vehicle and Route Visuals
- Model recognizable fire truck, ambulance and rescue vehicle units; place them at facility coordinates and show available, dispatched, en route and arrived states.
- Accept an ordered array of city waypoints from the route engine; draw the route and animate a unit along it.
- Handle rerouting or an unavailable route without leaving a vehicle moving on an invalid path.
- Expose arrival / animation-complete events (`onAnimationComplete`) to the application. Saved dispatch status changes happen through the response workflow, not only when animation ends.

### 04 Scene Quality
- Keep interaction usable on common laptop screens: responsive canvas, readable controls, modest asset size, consistent frame rate and no broken assets after deployment.
- Provide a paused-effects or low-quality fallback.
- Release scene resources when switching or closing scenarios; document any third-party asset licenses.

---

## 4. Platform, DevOps and Deployment Deliverables

### 05 Development and Deployment
- Provide root README with Windows 11 setup steps, prerequisites, commands for frontend/backend, sample data and a one-command local workflow where practical.
- Keep separate example environment files for client and server. Configure MongoDB through server-only environment variables; never commit real credentials, tokens or connection strings.
- Add CI checks for install, lint / type checks where configured, tests and frontend build.
- Document deployment steps, environment variables, health checks, rollback and seed / demo-data setup in `docs/DEPLOYMENT.md`.
- Host backend on Render (`render.yaml`), MongoDB on Atlas, and frontend on GitHub Pages (`deploy-web.yml`).
- Set up basic runtime logs and a health endpoint (`/api/health`); document how to diagnose a failed build, database connection or unavailable API. Keep secrets out of logs and browser bundles.

---

## 5. Shared Integration Contract

Defined in `packages/contracts/src/scene.ts` and `docs/INTEGRATION_CONTRACT.md`:

| Item | Expected Shape / Responsibility |
|---|---|
| **City location** | Stable `locationId`, `type`, `displayName` and scene position `{x, y, z}`. Scene positions map to road node IDs. |
| **Incident snapshot** | `id`, `type` (fire / flood / earthquake), `severity`, `locationId`, `status`, `affectedLocationIds` and `blockedRoadIds`. |
| **Unit snapshot** | `id`, `kind` (fire truck / ambulance / rescue), `status`, `facilityLocationId` and current location or road node. |
| **Route result** | `unitId`, `incidentId`, ordered waypoint IDs or coordinates; explicit no-route reason when blocked. Nilusha calculates, Kavindu renders. |
| **Scene actions** | `onLocationSelect(locationId)`, `onUnitSelect(unitId)`, `onAnimationComplete(assignmentId)`. Application handles state changes. |

---

## 6. Delivery Milestones & Checkpoints

| Milestone | Kavindu Delivers | Joint Check | Status |
|---|---|---|:---:|
| **1 - Contract & skeleton** | City grid / facility coordinates, scene shell and local setup | IDs, data shapes, repository structure and fire demo location agreed | In Progress |
| **2 - First complete fire flow** | City selection, fire visual, fire truck asset, route renderer; CI baseline | Create fire incident, assign truck, render route, show saved status | Pending |
| **3 - Additional scenarios** | Flood / earthquake effects, blocked-road visuals, ambulance / rescue vehicle models | Each scenario loads from incident data; route failure is understandable | Pending |
| **4 - Release quality** | Responsive scene, reduced-motion / low-quality modes, deployed environments, setup and troubleshooting docs | Full demo works from fresh setup and hosted URL | Deployment Done; Scene pending |

---

## 7. Definition of Done — 3D

A reviewer can load the city, identify facilities, select a building, display each disaster type at chosen severity, see a unit follow a supplied path and repeat the scenario without a page reload or stale visuals.

### Demo Story
Open the city → select a building → start a fire incident → show affected area → assign a fire truck → display its safe simulated route → watch it arrive → verify the dashboard and history reflect the same operation.
