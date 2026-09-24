import { useState, useMemo } from 'react';
import {
  RESCUE3D_CITY_CONFIG,
  type SceneIncidentSnapshot,
  type SceneUnitSnapshot,
  type SceneRoute,
  type SceneDisasterType,
  type IncidentSeverity,
} from '@rescue3d/contracts';
import { CitySceneCanvas } from '../scene/CitySceneCanvas';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SimulationDisclaimer } from '../components/SimulationDisclaimer';

export function SimulationPage(): JSX.Element {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>('bldg-metro-tower');
  const [disasterType, setDisasterType] = useState<SceneDisasterType>('fire');
  const [severity, setSeverity] = useState<IncidentSeverity>('high');
  const [lowMotion, setLowMotion] = useState(false);
  const [reducedQuality, setReducedQuality] = useState(false);

  // Active scenario state
  const [activeIncident, setActiveIncident] = useState<SceneIncidentSnapshot | null>(null);
  const [activeRoute, setActiveRoute] = useState<SceneRoute | null>(null);
  const [unitStatus, setUnitStatus] = useState<'available' | 'en_route' | 'arrived'>('available');
  const [logMessages, setLogMessages] = useState<string[]>([
    'System ready. 3D city loaded. Select a target facility and disaster scenario.',
  ]);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 7),
    ]);
  };

  // Units stationed at their respective facilities
  const units: SceneUnitSnapshot[] = useMemo(
    () => [
      {
        id: 'unit-fire-1',
        kind: 'fire_truck',
        status: unitStatus === 'available' ? 'available' : unitStatus === 'en_route' ? 'en_route' : 'arrived',
        facilityLocationId: 'facility-fire-station',
      },
      {
        id: 'unit-amb-1',
        kind: 'ambulance',
        status: 'available',
        facilityLocationId: 'facility-hospital',
      },
      {
        id: 'unit-rescue-1',
        kind: 'rescue',
        status: 'available',
        facilityLocationId: 'facility-rescue-station',
      },
    ],
    [unitStatus]
  );

  const selectedLocation = useMemo(
    () => RESCUE3D_CITY_CONFIG.locations.find((l) => l.locationId === selectedLocationId),
    [selectedLocationId]
  );

  // Start Disaster Scenario
  const handleStartIncident = () => {
    if (!selectedLocation) return;
    const newInc: SceneIncidentSnapshot = {
      id: `sim-inc-${Date.now()}`,
      type: disasterType,
      severity,
      locationId: selectedLocation.locationId,
      status: 'reported',
      affectedLocationIds: [selectedLocation.locationId],
      blockedRoadIds: disasterType === 'flood' ? ['road-mw-cw', 'road-cw-c'] : [],
    };
    setActiveIncident(newInc);
    setActiveRoute(null);
    setUnitStatus('available');
    addLog(
      `Disaster reported: ${disasterType.toUpperCase()} (Severity: ${severity.toUpperCase()}) at ${selectedLocation.displayName}`
    );
  };

  // Dispatch Emergency Unit along waypoints
  const handleDispatchUnit = () => {
    if (!activeIncident || !selectedLocation) return;

    // Pick appropriate unit
    const unit =
      disasterType === 'fire'
        ? units[0]
        : disasterType === 'earthquake'
        ? units[2]
        : units[1];

    const facility = RESCUE3D_CITY_CONFIG.locations.find(
      (l) => l.locationId === unit.facilityLocationId
    );
    if (!facility) return;

    // Generate waypoints from facility road node to target road node
    const waypoints = [
      {
        nodeId: facility.roadNodeId,
        x: facility.scenePosition.x,
        y: 0,
        z: facility.scenePosition.z,
      },
      {
        nodeId: 'node-c',
        x: 0,
        y: 0,
        z: (facility.scenePosition.z + selectedLocation.scenePosition.z) / 2,
      },
      {
        nodeId: selectedLocation.roadNodeId,
        x: selectedLocation.scenePosition.x,
        y: 0,
        z: selectedLocation.scenePosition.z,
      },
    ];

    const route: SceneRoute = {
      assignmentId: `route-${Date.now()}`,
      unitId: unit.id,
      incidentId: activeIncident.id,
      status: 'active',
      waypoints,
      distanceMeters: 850,
      estimatedSeconds: 6, // 6s animated transit for realistic review
      riskScore: severity === 'critical' ? 0.8 : severity === 'high' ? 0.6 : 0.3,
      avoidedRoadIds: activeIncident.blockedRoadIds,
    };

    setActiveRoute(route);
    setUnitStatus('en_route');
    setActiveIncident((prev) => (prev ? { ...prev, status: 'dispatched' } : null));
    addLog(
      `Dispatched ${unit.kind.replace('_', ' ')} from ${facility.displayName} via safe simulated route.`
    );
  };

  // Reset Scenario (Repeats scenario without page reload)
  const handleResetScenario = () => {
    setActiveIncident(null);
    setActiveRoute(null);
    setUnitStatus('available');
    addLog('Scenario cleared. City returned to normal operational baseline.');
  };

  return (
    <div className="flex flex-col gap-6">
      <SimulationDisclaimer />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            3D City Disaster & Response Simulator
          </h1>
          <p className="text-sm text-text-muted">
            Kavindu's 3D simulation environment integrated with Nilusha's emergency intelligence contract.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={lowMotion}
              onChange={(e) => setLowMotion(e.target.checked)}
              className="rounded border-border"
            />
            Low-Motion
          </label>
          <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={reducedQuality}
              onChange={(e) => setReducedQuality(e.target.checked)}
              className="rounded border-border"
            />
            Reduced Quality
          </label>
          <Button variant="ghost" onClick={handleResetScenario}>
            Reset Scenario
          </Button>
        </div>
      </div>

      {/* Main Simulation Layout */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* 3D Canvas Area */}
        <div className="flex flex-col gap-3">
          <CitySceneCanvas
            incidents={activeIncident ? [activeIncident] : []}
            units={units}
            routes={activeRoute ? [activeRoute] : []}
            selectedLocationId={selectedLocationId}
            options={{ lowMotion, reducedQuality }}
            actions={{
              onLocationSelect: (id) => {
                setSelectedLocationId(id);
                const loc = RESCUE3D_CITY_CONFIG.locations.find((l) => l.locationId === id);
                if (loc) addLog(`Target selected: ${loc.displayName}`);
              },
              onAnimationComplete: (assignmentId) => {
                setUnitStatus('arrived');
                setActiveIncident((prev) => (prev ? { ...prev, status: 'contained' } : null));
                addLog(`Emergency unit arrived at incident scene! Hazard contained.`);
              },
            }}
          />

          {/* Real-time simulation event stream */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Simulation Event Log
              </span>
              <span className="text-[10px] text-jade">Live Stream Active</span>
            </div>
            <div className="flex flex-col gap-1 font-mono text-xs text-text-muted">
              {logMessages.map((log, i) => (
                <p key={i} className={i === 0 ? 'text-text-primary font-medium' : 'opacity-75'}>
                  {log}
                </p>
              ))}
            </div>
          </Card>
        </div>

        {/* Tactical Control Panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="text-sm font-semibold text-text-primary mb-3">
              1. Select Target Building
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {RESCUE3D_CITY_CONFIG.locations
                .filter((l) => !l.locationId.startsWith('facility-'))
                .map((loc) => (
                  <button
                    key={loc.locationId}
                    onClick={() => {
                      setSelectedLocationId(loc.locationId);
                      addLog(`Target selected: ${loc.displayName}`);
                    }}
                    className={`rounded-lg border p-2.5 text-left transition ${
                      selectedLocationId === loc.locationId
                        ? 'border-jade bg-surface-raised text-jade font-semibold shadow-sm'
                        : 'border-border bg-surface text-text-muted hover:border-slate-600'
                    }`}
                  >
                    <p className="text-xs truncate">{loc.displayName}</p>
                    <p className="text-[10px] opacity-75 capitalize">{loc.type}</p>
                  </button>
                ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-text-primary mb-3">
              2. Configure Disaster
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Disaster Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['fire', 'flood', 'earthquake'] as SceneDisasterType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setDisasterType(t)}
                      className={`rounded-md border py-1.5 text-xs capitalize transition ${
                        disasterType === t
                          ? 'border-danger bg-danger/10 text-danger font-semibold'
                          : 'border-border bg-surface text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Severity Level</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['low', 'moderate', 'high', 'critical'] as IncidentSeverity[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={`rounded-md border py-1 text-[11px] capitalize transition ${
                        severity === s
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-semibold'
                          : 'border-border bg-surface text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleStartIncident}
                disabled={!selectedLocationId}
              >
                Trigger {disasterType.toUpperCase()} Incident
              </Button>
            </div>
          </Card>

          {/* Active Operation Status & Dispatch */}
          <Card>
            <h2 className="text-sm font-semibold text-text-primary mb-3">
              3. Emergency Dispatch
            </h2>
            {activeIncident ? (
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-border bg-surface-raised p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">
                      {activeIncident.type.toUpperCase()} Hazard
                    </span>
                    <Badge tone={activeIncident.status === 'contained' ? 'success' : 'danger'}>
                      {activeIncident.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    Location: {selectedLocation?.displayName}
                  </p>
                  {activeIncident.blockedRoadIds.length > 0 ? (
                    <p className="text-[11px] text-amber-400 mt-1">
                      Blocked Roads: {activeIncident.blockedRoadIds.join(', ')}
                    </p>
                  ) : null}
                </div>

                {activeRoute ? (
                  <div className="rounded-lg border border-border bg-surface p-2.5 text-xs text-text-muted">
                    <div className="flex justify-between">
                      <span>Simulated Safe Distance:</span>
                      <span className="font-semibold text-text-primary">
                        {activeRoute.distanceMeters} m
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Calculated Risk:</span>
                      <span className="font-semibold text-amber-400">
                        {Math.round(activeRoute.riskScore * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Unit Transit State:</span>
                      <span className="font-semibold text-jade capitalize">{unitStatus}</span>
                    </div>
                  </div>
                ) : null}

                <Button
                  variant="primary"
                  onClick={handleDispatchUnit}
                  disabled={unitStatus === 'en_route' || unitStatus === 'arrived'}
                >
                  {unitStatus === 'en_route'
                    ? 'Unit En Route...'
                    : unitStatus === 'arrived'
                    ? 'Unit On Scene (Contained)'
                    : 'Dispatch Recommended Unit'}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                Trigger a disaster above to activate emergency dispatch recommendations and waypoint route navigation.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
