import { Schema, model, Document, Types } from 'mongoose';
import type { IncidentType, IncidentSeverity, IncidentStatus } from '@rescue3d/contracts';

export interface IncidentDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: { lat: number; lng: number };
  reportedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const geoPointSchema = new Schema(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false },
);

const incidentSchema = new Schema<IncidentDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    type: {
      type: String,
      enum: ['fire', 'flood', 'earthquake', 'medical', 'hazmat', 'structural'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['reported', 'dispatched', 'in_progress', 'contained', 'resolved'],
      default: 'reported',
      required: true,
    },
    location: { type: geoPointSchema, required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

incidentSchema.index({ status: 1, severity: 1 });

export const Incident = model<IncidentDocument>('Incident', incidentSchema);
