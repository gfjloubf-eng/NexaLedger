import type { Role } from './permissions';

export type UserRole = {
  role: Role;
  assignedAt: number;
};

export function isRole(value: unknown): value is Role {
  return (
    value === 'owner' ||
    value === 'admin' ||
    value === 'accountant' ||
    value === 'employee' ||
    value === 'viewer'
  );
}

