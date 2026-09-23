# Deployment

## Frontend (live)

`apps/web` deploys automatically to GitHub Pages on every push to `main`
that touches the web app (`.github/workflows/deploy-web.yml`).

**Live URL:** https://nilushamadhuwanthi123.github.io/rescue3d-disaster-response-simulator/

Nothing to do here — it's already wired up.

## Backend (not yet hosted)

`apps/api` needs a real host to run on, plus a MongoDB database. Nothing
in GitHub itself can run a Node server, so this needs a separate service.
`render.yaml` at the repo root is a ready-to-use Render Blueprint.

### Steps

1. **MongoDB Atlas** (free, no card required):
   - Sign up at mongodb.com/cloud/atlas with GitHub.
   - Create a free M0 cluster.
   - Database Access → add a database user with a password.
   - Network Access → allow access from anywhere (`0.0.0.0/0`) — fine for
     this project's scale; tighten later if it matters.
   - Get the connection string from "Connect" → "Drivers" — looks like
     `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/rescue3d`.

2. **Render**:
   - Sign up at render.com with GitHub (free, no card required for the
     free web service tier).
   - New → Blueprint → select this repo. Render reads `render.yaml` and
     creates the `rescue3d-api` web service automatically.
   - After the first deploy, open the service's Environment tab and set
     `MONGODB_URI` to the Atlas connection string from step 1 (this one
     field is intentionally left blank in `render.yaml` — Render won't
     store a real secret in a file committed to the repo).
   - Wait for the deploy to finish, then copy the service's public URL
     (looks like `https://rescue3d-api.onrender.com`).

3. **Point the frontend at it**:
   - Repo → Settings → Secrets and variables → Actions → Variables tab.
   - Add `VITE_API_BASE_URL` = `https://<your-render-url>/api`
   - Add `VITE_SOCKET_URL` = `https://<your-render-url>`
   - Re-run the "Deploy web to GitHub Pages" workflow (Actions tab →
     select it → "Run workflow") so the frontend picks up the new URL.

Render's free tier spins the service down after inactivity and takes
~30-60s to wake back up on the next request — normal, not a bug. If that
becomes annoying, a paid Render plan or a different always-on host is a
later decision, not something to fix now.
