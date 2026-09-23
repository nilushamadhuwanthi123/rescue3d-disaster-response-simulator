import { Schema, model, Document, Types } from 'mongoose';
import type { IncidentEventType } from '@rescue3d/contracts';

export interface IncidentEventDocument extends Document {
  _id: Types.ObjectId;
  incidentId: Types.ObjectId;
  type: IncidentEventType;
  message: string;
  createdAt: Date;
}

const incidentEventSchema = new Schema<IncidentEventDocument>(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
    type: {
      type: String,
      enum: ['incident_reported', 'incident_status_changed', 'unit_assigned', 'assignment_status_changed'],
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

incidentEventSchema.index({ incidentId: 1, createdAt: 1 });

export const IncidentEvent = model<IncidentEventDocument>('IncidentEvent', incidentEventSchema);
