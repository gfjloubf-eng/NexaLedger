export type Role = 'owner' | 'admin' | 'accountant' | 'employee' | 'viewer';

export type Permission =
  | 'canManageUsers'
  | 'canManageRoles'
  | 'canViewReports'
  | 'canExportReports'
  | 'canManageInvoices'
  | 'canDeleteInvoices'
  | 'canManagePayments'
  | 'canAccessDecisionCenter'
  | 'canAccessForecast'
  | 'canManageSettings';

export const ROLE_HIERARCHY: ReadonlyArray<Role> = [
  'viewer',
  'employee',
  'accountant',
  'admin',
  'owner',
];

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  owner: new Set<Permission>([
    'canManageUsers',
    'canManageRoles',
    'canViewReports',
    'canExportReports',
    'canManageInvoices',
    'canDeleteInvoices',
    'canManagePayments',
    'canAccessDecisionCenter',
    'canAccessForecast',
    'canManageSettings',
  ]),
  admin: new Set<Permission>([
    'canViewReports',
    'canExportReports',
    'canManageInvoices',
    'canDeleteInvoices',
    'canManagePayments',
    'canAccessDecisionCenter',
    'canAccessForecast',
    'canManageSettings',
    // Users/roles management intentionally NOT included here; enforced by UI/service guards
    // and by DB constraints in the next phases.
  ]),
  accountant: new Set<Permission>([
    'canViewReports',
    'canManageInvoices',
    'canManagePayments',
    'canAccessForecast',
  ]),
  employee: new Set<Permission>(['canManageInvoices', 'canViewReports']),
  viewer: new Set<Permission>(['canViewReports']),
};

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;

  // Owner inherits everything.
  if (role === 'owner') return true;

  // Simple role mapping based on ROLE_PERMISSIONS.
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function rolesEqual(a: Role | null | undefined, b: Role | null | undefined): boolean {
  return a === b;
}

