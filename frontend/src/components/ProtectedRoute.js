import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // 'SuperAdmin', 'Admin', 'Employee'

  if (!token) return <Navigate to="/login" />;

  const currentPath = window.location.pathname;

  if (currentPath.includes('/admin') && role !== 'Admin') return <Navigate to="/" />;
  if (currentPath.includes('/super-admin') && role !== 'SuperAdmin') return <Navigate to="/" />;
  if (currentPath.includes('/employee') && role !== 'Employee') return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
