import type { AuthUser, UserRole } from '@rescue3d/contracts';
import { User, type UserDocument } from '../models/User.js';
import { HttpError } from '../utils/ApiError.js';

function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listUsers(): Promise<AuthUser[]> {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(toAuthUser);
}

/**
 * Refuses to demote the last remaining administrator — otherwise an admin
 * could lock every admin (including themselves) out of the admin tools
 * with no way back in short of a direct database edit. Pure so the rule
 * itself is unit-testable without a database.
 */
export function canChangeRole(
  currentRole: UserRole,
  nextRole: UserRole,
  otherAdministratorCount: number,
): boolean {
  if (currentRole !== 'administrator' || nextRole === 'administrator') return true;
  return otherAdministratorCount > 0;
}

export async function updateUserRole(userId: string, nextRole: UserRole): Promise<AuthUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw HttpError.notFound('User not found.');
  }

  const otherAdmins = await User.countDocuments({ role: 'administrator', _id: { $ne: user._id } });
  if (!canChangeRole(user.role, nextRole, otherAdmins)) {
    throw HttpError.badRequest('Cannot remove the last remaining administrator.');
  }

  user.role = nextRole;
  await user.save();
  return toAuthUser(user);
}
