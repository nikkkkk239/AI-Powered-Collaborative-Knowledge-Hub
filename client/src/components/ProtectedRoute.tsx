import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token ,team} = useAuthStore();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  if(!user?.teamId || user.teamId === ''){
    return <Navigate to="/joinTeam" replace />;
  }

  return <>{children}</>;
};