import { Schema, model, Document, Types } from 'mongoose';

export interface RefreshSessionDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const refreshSessionSchema = new Schema<RefreshSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Sessions past their expiry are purged automatically; revoked ones are kept
// for audit but excluded from the "active session" queries in AuthService.
refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshSession = model<RefreshSessionDocument>(
  'RefreshSession',
  refreshSessionSchema,
);
