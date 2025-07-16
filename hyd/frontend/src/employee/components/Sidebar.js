import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const employeeLinks = [
  { path: '/employee', label: 'Dashboard', icon: <span role="img" aria-label="dashboard">🏠</span> },
  { path: '/employee/announcements', label: 'Announcements', icon: <span role="img" aria-label="announcements">📢</span> },
  { path: '/employee/book-room', label: 'Book Room', icon: <span role="img" aria-label="book room">🏢</span> },
  { path: '/employee/my-bookings', label: 'My Bookings', icon: <span role="img" aria-label="bookings">📅</span> },
  { path: '/employee/calendar', label: 'Calendar', icon: <span role="img" aria-label="calendar">🗓️</span> },
  { path: '/employee/raise-issue', label: 'Raise Issue', icon: <span role="img" aria-label="issue">🛠️</span> },
  { path: '/employee/view-polls', label: 'View Polls', icon: <span role="img" aria-label="polls">🗳️</span> },
  { path: '/change-password', label: 'Change Password', icon: <span role="img" aria-label="change password">🔑</span> },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/settings', label: 'Settings', icon: <span role="img" aria-label="settings">⚙️</span> },
];

const SIDEBAR_WIDTH = 240;

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside
      style={{
        width: SIDEBAR_WIDTH,
        background: '#111',
        height: 'calc(100vh - 72px)',
        color: '#fff',
        padding: 0,
        position: 'fixed',
        top: '72px',
        left: 0,
        boxShadow: '2px 0 12px rgba(0,0,0,0.13)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100
      }}
    >
      <div style={{
        height: '64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: '24px',
        background: '#111',
        borderBottom: '1px solid #222'
      }}>
        <span style={{
          fontSize: '1.7rem',
          color: '#00bfff',
          fontWeight: 900,
          letterSpacing: '1.5px',
          marginTop: '2px'
        }}>
          Employee
        </span>
      </div>
      {/* Scrollable menu with hidden scrollbar */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE 10+
        }}
      >
        <style>
          {`
            /* Hide scrollbar for Chrome, Safari and Opera */
            div[style*="overflow-y: auto"]::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <ul style={{ listStyle: 'none', padding: '28px 0 0 0', margin: 0 }}>
          {employeeLinks.map(({ path, label, icon }) => {
            // FIXED: Custom active logic for dashboard
            const isActive = path === '/employee' 
              ? location.pathname === '/employee'
              : location.pathname === path;

            return (
              <li key={path} style={{ marginBottom: '14px' }}>
                <NavLink
                  to={path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: isActive ? '#00bfff' : '#e3e9f7',
                    textDecoration: 'none',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '1.18rem',
                    padding: '14px 24px',
                    borderRadius: '8px 0 0 8px',
                    background: isActive ? 'rgba(0,191,255,0.13)' : 'none',
                    boxShadow: isActive ? '0 2px 12px rgba(0,191,255,0.08)' : 'none',
                    transition: 'background 0.18s, color 0.18s, box-shadow 0.18s'
                  }}
                >
                  <span style={{ marginRight: '16px', fontSize: '1.4em' }}>{icon}</span>
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      <div style={{
        padding: '22px 0 14px 0',
        textAlign: 'center',
        fontSize: '1rem',
        color: '#bbdefb',
        borderTop: '1px solid #222'
      }}>
        &copy; {new Date().getFullYear()} INCOR
      </div>
    </aside>
  );
};

export default Sidebar;