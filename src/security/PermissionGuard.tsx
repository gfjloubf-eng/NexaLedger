import React from 'react';
import type { Permission } from './permissions';
import type { Role } from './permissions';
import { hasPermission } from './permissions';
import { getUserRole } from './userRoleStore';
import { useAuth } from '../context/AuthProvider';

type Props = {
  permission?: Permission;
  permissions?: Permission[];
  allowedRoles?: Role[];
  fallback?: React.ReactNode;
};

export default function PermissionGuard({
  permission,
  permissions,
  allowedRoles,
  fallback = null,
}: Props) {
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user?.id) {
        if (!cancelled) setAllowed(false);
        return;
      }

      const { role } = await getUserRole(user.id);
      if (!role) {
        if (!cancelled) setAllowed(false);
        return;
      }

      if (Array.isArray(allowedRoles) && allowedRoles.length) {
        if (!allowedRoles.includes(role)) {
          if (!cancelled) setAllowed(false);
          return;
        }
      }

      const required = permissions ?? (permission ? [permission] : []);
      if (!required.length) {
        if (!cancelled) setAllowed(true);
        return;
      }

      for (const p of required) {
        if (!hasPermission(role, p)) {
          if (!cancelled) setAllowed(false);
          return;
        }
      }

      if (!cancelled) setAllowed(true);
    };

    setAllowed(null);
    if (!loading) void run();

    return () => {
      cancelled = true;
    };
  }, [user?.id, loading, permission, permissions, allowedRoles]);

  if (loading || allowed === null) return null;
  if (!allowed) return <>{fallback}</>;
  return <>{/* authorized */}</>;
}

