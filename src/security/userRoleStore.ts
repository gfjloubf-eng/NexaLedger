import { supabase } from '../lib/supabase';
import type { Role } from './permissions';
import type { UserRole } from './roleModel';

const USER_ROLES_TABLE = 'user_roles';

// This store is Phase 1/2 scaffolding. It reads role assignments from DB.
// In later phases we'll add user management + audit logging.

export type GetUserRoleResult = {
  role: Role | null;
  assignedAt: number | null;
};

export async function getUserRole(userId: string): Promise<GetUserRoleResult> {
  if (!userId) return { role: null, assignedAt: null };

  const { data, error } = await supabase
    .from(USER_ROLES_TABLE)
    .select('role, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Fail closed: unknown role => null.
    console.error('[RBAC] getUserRole failed', error);
    return { role: null, assignedAt: null };
  }

  const role = (data?.role ?? null) as Role | null;
  const assignedAt = data?.created_at ? new Date(data.created_at).getTime() : null;

  // Defensive: ensure valid role value
  if (
    role !== 'owner' &&
    role !== 'admin' &&
    role !== 'accountant' &&
    role !== 'employee' &&
    role !== 'viewer'
  ) {
    return { role: null, assignedAt: null };
  }

  return { role, assignedAt };
}

export async function upsertUserRole(userId: string, nextRole: Role): Promise<UserRole> {
  const { data, error } = await supabase
    .from(USER_ROLES_TABLE)
    .upsert(
      {
        user_id: userId,
        role: nextRole,
      },
      { onConflict: 'user_id' }
    )
    .select('role, created_at')
    .maybeSingle();

  if (error) {
    console.error('[RBAC] upsertUserRole failed', error);
    throw new Error('Role assignment failed');
  }

  const role = (data?.role ?? nextRole) as Role;
  const assignedAt = data?.created_at ? new Date(data.created_at).getTime() : Date.now();

  return { role, assignedAt };
}

