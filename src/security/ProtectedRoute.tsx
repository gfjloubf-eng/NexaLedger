import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';


type Props = {
  // Emergency bypass: these props are ignored.
  requiredPermission?: unknown;
  requiredPermissions?: unknown[];
  allowedRoles?: unknown[];
  fallbackPath?: string;
  children?: React.ReactNode;
};


// EMERGENCY RBAC RECOVERY MODE
// Temporarily bypass all RBAC enforcement to restore app access.
// Intentionally ignore requiredPermission / requiredPermissions / allowedRoles.

export default function ProtectedRoute({
  children,
}: Props) {
  const { user, loading } = useAuth();


  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center text-slate-600">
        جاري تحميل التطبيق...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (children) return <>{children}</>;
  return <Outlet />;
}


