import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiresAuth = true }) => {
  const token = localStorage.getItem('token');
  
  if (requiresAuth && !token) {
    // Redirect to login if authentication is required but no token exists
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
