import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { toast } from 'react-toastify';
import SuperAdminSidebar from '../superadmin/components/Sidebar';
import AdminSidebar from '../admin/components/Sidebar';
import EmployeeSidebar from '../employee/components/Sidebar';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    bookingReminders: true,
    announcementNotifications: true,
    
    // Booking Preferences
    defaultBookingDuration: 60, // minutes
    reminderTime: 15, // minutes before booking
    
    // Display Preferences
    timeFormat: '12', // '12' or '24'
    dateFormat: 'DD/MM/YYYY'
  });

  const role = localStorage.getItem('role');
  let Sidebar = null;
  if (role === 'SuperAdmin') Sidebar = SuperAdminSidebar;
  else if (role === 'Admin') Sidebar = AdminSidebar;
  else if (role === 'Employee') Sidebar = EmployeeSidebar;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/api/auth/settings');
      setSettings({ ...settings, ...res.data });
    } catch (err) {
      console.log('Using default settings');
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.put('/api/auth/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7fafd' }}>
      {Sidebar && <Sidebar />}
      <div style={{
        flex: 1,
        padding: '40px',
        maxWidth: '700px',
        margin: '0 auto',
        marginLeft: role ? '280px' : 'auto'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
          padding: '40px'
        }}>
          <h2 style={{ 
            marginBottom: '30px', 
            color: '#333', 
            fontSize: '2rem', 
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            ⚙️ Settings
          </h2>

          {/* Notification Settings */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ 
              color: '#007bff', 
              marginBottom: '20px', 
              fontSize: '1.4rem',
              borderBottom: '2px solid #e3e7ee',
              paddingBottom: '10px'
            }}>
              📧 Notification Preferences
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: '#555',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  style={{ marginRight: '12px', transform: 'scale(1.3)' }}
                />
                <span>📨 Email notifications for announcements and updates</span>
              </label>

              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: '#555',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={settings.bookingReminders}
                  onChange={(e) => handleChange('bookingReminders', e.target.checked)}
                  style={{ marginRight: '12px', transform: 'scale(1.3)' }}
                />
                <span>⏰ Booking reminder notifications</span>
              </label>

              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: '#555',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={settings.announcementNotifications}
                  onChange={(e) => handleChange('announcementNotifications', e.target.checked)}
                  style={{ marginRight: '12px', transform: 'scale(1.3)' }}
                />
                <span>📢 Push notifications for new announcements</span>
              </label>
            </div>
          </div>

          {/* Booking Preferences */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ 
              color: '#007bff', 
              marginBottom: '20px', 
              fontSize: '1.4rem',
              borderBottom: '2px solid #e3e7ee',
              paddingBottom: '10px'
            }}>
              📅 Booking Preferences
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px' 
            }}>
              <div>
                <label style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  display: 'block',
                  color: '#333',
                  fontSize: '16px'
                }}>
                  🕐 Default Booking Duration:
                </label>
                <select
                  value={settings.defaultBookingDuration}
                  onChange={(e) => handleChange('defaultBookingDuration', parseInt(e.target.value))}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '2px solid #e3e7ee', 
                    width: '100%',
                    fontSize: '16px',
                    background: '#f8fafc'
                  }}
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  display: 'block',
                  color: '#333',
                  fontSize: '16px'
                }}>
                  ⏰ Reminder Time:
                </label>
                <select
                  value={settings.reminderTime}
                  onChange={(e) => handleChange('reminderTime', parseInt(e.target.value))}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '2px solid #e3e7ee', 
                    width: '100%',
                    fontSize: '16px',
                    background: '#f8fafc'
                  }}
                >
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                </select>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ 
              color: '#007bff', 
              marginBottom: '20px', 
              fontSize: '1.4rem',
              borderBottom: '2px solid #e3e7ee',
              paddingBottom: '10px'
            }}>
              🎨 Display Preferences
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px' 
            }}>
              <div>
                <label style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  display: 'block',
                  color: '#333',
                  fontSize: '16px'
                }}>
                  🕒 Time Format:
                </label>
                <select
                  value={settings.timeFormat}
                  onChange={(e) => handleChange('timeFormat', e.target.value)}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '2px solid #e3e7ee', 
                    width: '100%',
                    fontSize: '16px',
                    background: '#f8fafc'
                  }}
                >
                  <option value="12">12-hour (2:30 PM)</option>
                  <option value="24">24-hour (14:30)</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  display: 'block',
                  color: '#333',
                  fontSize: '16px'
                }}>
                  📅 Date Format:
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '2px solid #e3e7ee', 
                    width: '100%',
                    fontSize: '16px',
                    background: '#f8fafc'
                  }}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (25/12/2024)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/25/2024)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-25)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ 
              color: '#007bff', 
              marginBottom: '20px', 
              fontSize: '1.4rem',
              borderBottom: '2px solid #e3e7ee',
              paddingBottom: '10px'
            }}>
              🔐 Account Settings
            </h3>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.href = '/change-password'}
                style={{
                  padding: '12px 24px',
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔑 Change Password
              </button>

              <button
                onClick={() => window.location.href = '/profile'}
                style={{
                  padding: '12px 24px',
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                👤 Edit Profile
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '16px 50px',
                background: 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
              }}
            >
              💾 Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;