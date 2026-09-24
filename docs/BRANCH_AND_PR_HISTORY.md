# Branch and PR History — Rescue3D

This document records what has been built, tested, and merged into `main`. In accordance with our engineering principles, every entry corresponds to real code verified with automated tests and builds.

---

## Merged Pull Requests

| PR # | Branch | Author | Description | Verification |
|---|---|---|---|---|
| **#1** | `feature/nilusha-foundation-auth-design-system` | `@nilushamadhuwanthi123` | Monorepo layout, shared contracts package, design system (dark theme, glassmorphism, responsive components), JWT authentication, user registration/login. | Unit tests (auth service, token generation), typecheck clean, frontend builds. |
| **#2** | `feature/nilusha-incident-command-center` | `@nilushamadhuwanthi123` | Incident reporting, incident lifecycle management, emergency resource unit registry, operator dispatch workflows. | REST API integration tests, form validation tests. |
| **#3** | `feature/nilusha-response-routing-engine` | `@nilushamadhuwanthi123` | Deterministic simulated safe routing engine, haversine distance, explainable ETA & risk scoring, waypoints generation, `GET /api/assignments/:id/route`, initial `docs/INTEGRATION_CONTRACT.md`. | 11 routing unit tests, contract type verification. |
| **#4** | `feature/nilusha-analytics-reports-replay` | `@nilushamadhuwanthi123` | Analytics dashboard, operation response metrics, incident timeline audit trail, operation reports. | Controller & service unit tests, Recharts rendering. |
| **#5** | `feature/nilusha-realtime-admin-quality` | `@nilushamadhuwanthi123` | Socket.IO real-time synchronization, admin controls, seed scripts, comprehensive test suite pass (61/61 tests). | Full test suite clean, socket integration test verified. |
| **#6** | `chore/deploy-frontend-github-pages` | `@nilushamadhuwanthi123` | Automated GitHub Actions workflow (`deploy-web.yml`) deploying `apps/web` to GitHub Pages with SPA fallback. | Live deployment at GitHub Pages verified. |
| **#7** | `chore/deploy-backend-render` | `@nilushamadhuwanthi123` | NodeNext ESM runnable build configuration, `render.yaml` Blueprint for Render web service, `docs/DEPLOYMENT.md`. | Live production deployment on Render with MongoDB Atlas verified. |

---

## Active & Upcoming Branches (Kavindu's 3D & Visualization Scope)

| Feature Branch | Owner | Focus |
|---|---|---|
| `feature/kavindu-city-scene-contract` | `@kavindu-maduhansa` | 3D City foundation, stable building & road node IDs, reproducible city config, camera controls (orbit/pan/zoom), shared contracts expansion. |
| `feature/kavindu-disaster-effects` | `@kavindu-maduhansa` | Visual disaster effects (fire flames/smoke, rising flood water, earthquake shake), low-motion mode. |
| `feature/kavindu-vehicle-visualization` | `@kavindu-maduhansa` | 3D vehicle models (fire truck, ambulance, rescue), waypoint path animation, arrival event callbacks. |
| `chore/kavindu-scene-quality-docs` | `@kavindu-maduhansa` | Performance tuning, laptop responsiveness, resource disposal, third-party asset licenses documentation. |
