import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center text-slate-600">
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

