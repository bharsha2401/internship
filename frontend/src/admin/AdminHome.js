import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';


const AdminHome = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      // If user tries to leave /admin, push them back
      if (!location.pathname.startsWith('/admin')) {
        navigate('/admin', { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: '300px', // Same as sidebar width
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

export default AdminHome;