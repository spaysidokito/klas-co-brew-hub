import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = sessionStorage.getItem('staffAuth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }

  return <>{children}</>;
};
