import { z } from 'zod';

const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const createIncidentSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(4000),
  type: z.enum(['fire', 'flood', 'earthquake', 'medical', 'hazmat', 'structural']),
  severity: z.enum(['low', 'moderate', 'high', 'critical']),
  location: geoPointSchema,
});

export const updateIncidentStatusSchema = z.object({
  status: z.enum(['reported', 'dispatched', 'in_progress', 'contained', 'resolved']),
});

export const listIncidentsQuerySchema = z.object({
  status: z.enum(['reported', 'dispatched', 'in_progress', 'contained', 'resolved']).optional(),
});

export const createUnitSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(['fire_engine', 'ambulance', 'rescue_team', 'hazmat_unit', 'police']),
  location: geoPointSchema,
});

export const setUnitStatusSchema = z.object({
  status: z.enum(['available', 'dispatched', 'on_scene', 'returning', 'out_of_service']),
});

export const listUnitsQuerySchema = z.object({
  status: z.enum(['available', 'dispatched', 'on_scene', 'returning', 'out_of_service']).optional(),
});

export const createAssignmentSchema = z.object({
  incidentId: z.string().min(1),
  unitId: z.string().min(1),
});

export const updateAssignmentStatusSchema = z.object({
  status: z.enum(['assigned', 'en_route', 'on_scene', 'released']),
});
