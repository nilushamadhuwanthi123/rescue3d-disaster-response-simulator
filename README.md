# Rescue3D

**Full title:** Rescue3D — A 3D Interactive Disaster Management and Emergency Response Simulator

Rescue3D is a web-based educational disaster-management simulator combining an interactive 3D city, disaster simulation, emergency-resource management, simulated safe-route planning, real-time rescue operations, analytics and reports.

> Rescue3D is an educational simulation. Routes, risk scores, resource recommendations and response times are simulated and must not be used for real emergency decisions.

## Team

| Name | GitHub | Role |
|---|---|---|
| Nilusha Madhuwanthi Jayasekara | [@nilushamadhuwanthi123](https://github.com/nilushamadhuwanthi123) | Full-Stack Product, Incident Intelligence and Emergency Response Lead |
| Kavindu Madhuhansa Liyanage | [@kavindu-maduhansa](https://github.com/kavindu-maduhansa) | 3D Simulation, Disaster Visualization and DevOps Lead |

See [docs/NILUSHA_SCOPE.md](docs/NILUSHA_SCOPE.md) and [docs/KAVINDU_SCOPE.md](docs/KAVINDU_SCOPE.md) for the full ownership split.

## Stack

- **Frontend:** React, TypeScript, Vite, React Router, React Three Fiber / Three.js / Drei, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Zod, Recharts, Framer Motion, Socket.IO Client
- **Backend:** Node.js, Express, TypeScript, MongoDB/Mongoose, Socket.IO, JWT auth, bcrypt, Zod validation, Swagger/OpenAPI, Helmet
- **Quality:** ESLint, Prettier, Vitest, React Testing Library, Supertest, Playwright, GitHub Actions, Docker Compose

## Monorepo layout

```
apps/
  web/        React + Three.js frontend
  api/        Express + MongoDB backend
packages/
  contracts/  Shared TypeScript types (API + 3D scene contracts)
  simulation-core/  Routing engine, recommendation engine, simulation logic
  ui/         Shared design-system components
  config/     Shared ESLint/TS config
docs/         Architecture, API, scope and integration documentation
```

## Getting started

```bash
nvm use
npm install
cp .env.example apps/api/.env
cp .env.example apps/web/.env
npm run dev:api
npm run dev:web
```

Requires a local or Docker MongoDB instance — see `docker-compose.yml`.

## Status

This project is under active development. See [docs/BRANCH_AND_PR_HISTORY.md](docs/BRANCH_AND_PR_HISTORY.md) for what has actually been built and verified so far — this README will be kept in sync with real progress only.
