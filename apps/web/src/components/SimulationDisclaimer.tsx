import { SIMULATION_DISCLAIMER } from '@rescue3d/contracts';

/**
 * Shown on every screen that displays routes, risk scores, or response
 * recommendations — Rescue3D is an educational simulation and must never
 * be mistaken for a real emergency-response tool.
 */
export function SimulationDisclaimer(): JSX.Element {
  return (
    <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
      {SIMULATION_DISCLAIMER}
    </p>
  );
}
