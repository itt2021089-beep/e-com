import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { token, user } = useAuthStore();

  // 1. If there's no token, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the route requires a specific role (e.g., ADMIN) and the user doesn't have it, redirect to home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Otherwise, render the child routes securely
  return <Outlet />;
};