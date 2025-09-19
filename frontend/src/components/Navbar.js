import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');

  const handleLogoClick = () => {
    if (!token) {
      navigate('/');
    } else {
      if (role === 'SuperAdmin') navigate('/super-admin');
      else if (role === 'Admin') navigate('/admin');
      else if (role === 'Employee') navigate('/employee');
      else navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav style={{
      width: '100%',
      background: 'linear-gradient(90deg,rgb(0, 0, 0) 60%,rgb(0, 0, 0) 100%)',
      color: '#fff',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '72px',
      boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxSizing: 'border-box'
    }}>
      <div 
        onClick={handleLogoClick}
        style={{
          fontSize: '1.6rem',
          fontWeight: 'bold',
          color: '#fff',
          letterSpacing: '1px',
          cursor: 'pointer',
          transition: 'color 0.2s, transform 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.color = '#00bfff';
          e.target.style.transform = 'scale(1.02)';
        }}
        onMouseOut={(e) => {
          e.target.style.color = '#fff';
          e.target.style.transform = 'scale(1)';
        }}
      >
        INCOR GROUP
      </div>
      {isLoggedIn && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', marginRight: '8px' }}>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: '0.9em', color: '#b3e5fc' }}>{role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
