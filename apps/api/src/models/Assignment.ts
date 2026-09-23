import { Schema, model, Document, Types } from 'mongoose';
import type { AssignmentStatus } from '@rescue3d/contracts';

export interface AssignmentDocument extends Document {
  _id: Types.ObjectId;
  incidentId: Types.ObjectId;
  unitId: Types.ObjectId;
  status: AssignmentStatus;
  assignedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<AssignmentDocument>(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'ResponseUnit', required: true, index: true },
    status: {
      type: String,
      enum: ['assigned', 'en_route', 'on_scene', 'released'],
      default: 'assigned',
      required: true,
    },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

// A unit can only carry one *active* (non-released) assignment at a time —
// enforced in AssignmentService, not just at the schema level, since it's a
// cross-document business rule, not a structural constraint.
assignmentSchema.index({ unitId: 1, status: 1 });

export const Assignment = model<AssignmentDocument>('Assignment', assignmentSchema);
