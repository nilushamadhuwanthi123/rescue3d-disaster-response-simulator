import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@rescue3d/contracts';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['administrator', 'coordinator', 'operator', 'analyst', 'viewer'],
      default: 'viewer',
      required: true,
    },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = function comparePassword(
  this: UserDocument,
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = model<UserDocument>('User', userSchema);
