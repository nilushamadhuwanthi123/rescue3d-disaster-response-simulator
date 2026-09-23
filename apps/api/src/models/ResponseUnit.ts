import { Schema, model, Document, Types } from 'mongoose';
import type { UnitType, UnitStatus } from '@rescue3d/contracts';

export interface ResponseUnitDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  type: UnitType;
  status: UnitStatus;
  location: { lat: number; lng: number };
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

const responseUnitSchema = new Schema<ResponseUnitDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    type: {
      type: String,
      enum: ['fire_engine', 'ambulance', 'rescue_team', 'hazmat_unit', 'police'],
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'dispatched', 'on_scene', 'returning', 'out_of_service'],
      default: 'available',
      required: true,
    },
    location: { type: geoPointSchema, required: true },
  },
  { timestamps: true },
);

responseUnitSchema.index({ status: 1, type: 1 });

export const ResponseUnit = model<ResponseUnitDocument>('ResponseUnit', responseUnitSchema);
