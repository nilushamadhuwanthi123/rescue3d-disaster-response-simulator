import { useCallback, useEffect, useState } from 'react';
import type { Incident, ResponseUnit } from '@rescue3d/contracts';
import { Card } from '../components/ui/Card';
import { SimulationDisclaimer } from '../components/SimulationDisclaimer';
import { CreateIncidentForm } from './incidents/CreateIncidentForm';
import { IncidentCard } from './incidents/IncidentCard';
import * as incidentApi from '../lib/incidentApi';

export function IncidentCommandCenterPage(): JSX.Element {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [units, setUnits] = useState<ResponseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [incidentList, unitList] = await Promise.all([
        incidentApi.listIncidents(),
        incidentApi.listUnits(),
      ]);
      setIncidents(incidentList);
      setUnits(unitList);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const availableUnits = units.filter((u) => u.status === 'available');

  async function handleAdvanceStatus(id: string) {
    const incident = incidents.find((i) => i.id === id);
    const nextStatus: Record<string, string> = {
      reported: 'dispatched',
      dispatched: 'in_progress',
      in_progress: 'contained',
      contained: 'resolved',
    };
    if (!incident || !nextStatus[incident.status]) return;
    await incidentApi.updateIncidentStatus(id, {
      status: nextStatus[incident.status] as Incident['status'],
    });
    await refresh();
  }

  async function handleAssignUnit(incidentId: string, unitId: string) {
    await incidentApi.createAssignment({ incidentId, unitId });
    await refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <SimulationDisclaimer />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold text-text-primary">Active incidents</h1>
          {loading ? <p className="text-sm text-text-muted">Loading...</p> : null}
          {loadError ? <p className="text-sm text-danger">{loadError}</p> : null}
          {!loading && incidents.length === 0 ? (
            <Card>
              <p className="text-sm text-text-muted">No incidents reported yet.</p>
            </Card>
          ) : null}
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              availableUnits={availableUnits}
              onAdvanceStatus={handleAdvanceStatus}
              onAssignUnit={handleAssignUnit}
            />
          ))}
        </div>

        <Card className="h-fit">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Report an incident</h2>
          <CreateIncidentForm
            onSubmit={async (input) => {
              await incidentApi.createIncident(input);
              await refresh();
            }}
          />
        </Card>
      </div>
    </div>
  );
}
