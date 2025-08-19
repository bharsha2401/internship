import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

const EmployeeHome = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      // If user tries to leave /employee, push them back
      if (!location.pathname.startsWith('/employee')) {
        navigate('/employee', { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: '190px', // Adjust if your sidebar width is different
          padding: '32px 16px',
          boxSizing: 'border-box',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeHome;
