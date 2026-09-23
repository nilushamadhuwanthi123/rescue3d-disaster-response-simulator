export type IncidentType = 'fire' | 'flood' | 'earthquake' | 'medical' | 'hazmat' | 'structural';

export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';

export type IncidentStatus = 'reported' | 'dispatched' | 'in_progress' | 'contained' | 'resolved';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: GeoPoint;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: GeoPoint;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
}

export type UnitType = 'fire_engine' | 'ambulance' | 'rescue_team' | 'hazmat_unit' | 'police';

export type UnitStatus = 'available' | 'dispatched' | 'on_scene' | 'returning' | 'out_of_service';

export interface ResponseUnit {
  id: string;
  name: string;
  type: UnitType;
  status: UnitStatus;
  location: GeoPoint;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRequest {
  name: string;
  type: UnitType;
  location: GeoPoint;
}

export type AssignmentStatus = 'assigned' | 'en_route' | 'on_scene' | 'released';

export interface Assignment {
  id: string;
  incidentId: string;
  unitId: string;
  status: AssignmentStatus;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  incidentId: string;
  unitId: string;
}

export interface UpdateAssignmentStatusRequest {
  status: AssignmentStatus;
}
