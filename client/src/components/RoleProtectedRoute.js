import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleProtectedRoute({ allowedRole }) {
  const { user, loading } = useAuth();

  console.log('RoleProtectedRoute - Loading:', loading, 'User:', user, 'Allowed Role:', allowedRole);

  if (loading) {
    return <div className="text-center text-gray-400 py-20">Loading...</div>;
  }

  if (!user) {
    console.log('RoleProtectedRoute - No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    console.log('RoleProtectedRoute - Role mismatch, redirecting to /');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}