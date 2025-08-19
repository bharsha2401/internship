import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState('/default-profile.png');
  const [showDropdown, setShowDropdown] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('name') || 'User';

  // Function to fetch profile picture
  const fetchProfilePic = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProfilePic(data.picture ? `${process.env.REACT_APP_API_URL}${data.picture}` : '/default-profile.png');
    } catch {
      setProfilePic('/default-profile.png');
    }
  };

  useEffect(() => {
    fetchProfilePic();
  }, [token]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfilePic();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    setShowDropdown(false);
  };

  // Function to navigate to the appropriate dashboard based on role
  const handleLogoClick = () => {
    if (!token) {
      navigate('/');
    } else {
      if (role === 'SuperAdmin') {
        navigate('/super-admin');
      } else if (role === 'Admin') {
        navigate('/admin');
      } else if (role === 'Employee') {
        navigate('/employee');
      } else {
        navigate('/');
      }
    }
  };

  const handleDropdownClick = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  // Toggle dropdown
  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
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
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        height: '100%',
        paddingRight: '8px'
      }}>
        {token && (
          <>
            {/* Profile Dropdown */}
            <div 
              className="profile-dropdown-container"
              style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                height: '100%'
              }}
            >
              {/* Profile Button with Dropdown Arrow */}
              <div 
                onClick={handleProfileClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                  background: showDropdown ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!showDropdown) {
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showDropdown) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <img
                  src={profilePic}
                  alt="Profile"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #007bff',
                    pointerEvents: 'none'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  pointerEvents: 'none'
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: '#fff'
                  }}>
                    {userName}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#bbb'
                  }}>
                    {role}
                  </span>
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#fff',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  pointerEvents: 'none'
                }}>
                  ▼
                </span>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: '0',
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                  border: '1px solid #e3e7ee',
                  minWidth: '200px',
                  zIndex: 10000,
                  overflow: 'hidden'
                }}>
                  {/* User Info Header */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e3e7ee',
                    background: '#f8fafc'
                  }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: '4px'
                    }}>
                      {userName}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '8px 0' }}>
                    <div 
                      onClick={() => handleDropdownClick('/profile')}
                      style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#333',
                        fontSize: '15px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <span>👤</span>
                      View Profile
                    </div>

                    <div 
                      onClick={() => handleDropdownClick('/settings')}
                      style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#333',
                        fontSize: '15px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <span>⚙️</span>
                      Settings
                    </div>

                    <div 
                      onClick={() => handleDropdownClick('/change-password')}
                      style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#333',
                        fontSize: '15px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <span>🔑</span>
                      Change Password
                    </div>

                    {/* Dashboard Link */}
                    <div 
                      onClick={() => {
                        if (role === 'SuperAdmin') handleDropdownClick('/super-admin');
                        else if (role === 'Admin') handleDropdownClick('/admin');
                        else if (role === 'Employee') handleDropdownClick('/employee');
                      }}
                      style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#333',
                        fontSize: '15px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <span>🏠</span>
                      Dashboard
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Separate Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(90deg, #e74c3c 60%, #c0392b 100%)',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(231,76,60,0.15)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #c0392b 60%, #a93226 100%)';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(231,76,60,0.25)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #e74c3c 60%, #c0392b 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(231,76,60,0.15)';
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
