import React, { useState } from 'react';
import axios from 'axios';
import SuperAdminSidebar from '../superadmin/components/Sidebar';
import AdminSidebar from '../admin/components/Sidebar';
import EmployeeSidebar from '../employee/components/Sidebar';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const role = localStorage.getItem('role');

  // Choose sidebar based on role
  let Sidebar = null;
  if (role === 'SuperAdmin') Sidebar = SuperAdminSidebar;
  else if (role === 'Admin') Sidebar = AdminSidebar;
  else if (role === 'Employee') Sidebar = EmployeeSidebar;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to change your password.');
      return;
    }
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message || 'Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Session expired or unauthorized. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong');
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7fafd' }}>
      {Sidebar && <Sidebar />}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            background: '#fff',
            padding: '36px 32px 28px 32px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            margin: '32px 0',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '28px',
              color: '#222',
              fontWeight: 700,
              letterSpacing: '1px',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span role="img" aria-label="lock">🔒</span> Change Password
          </h2>
          <form onSubmit={handleChangePassword}>
            <label
              htmlFor="oldPassword"
              style={{
                fontWeight: 'bold',
                color: '#222',
                marginBottom: '6px',
                display: 'block',
                fontSize: '1.08rem',
              }}
            >
              Old Password:
            </label>
            <input
              id="oldPassword"
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '18px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                background: '#f8fafc',
                boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
            />
            <label
              htmlFor="newPassword"
              style={{
                fontWeight: 'bold',
                color: '#222',
                marginBottom: '6px',
                display: 'block',
                fontSize: '1.08rem',
              }}
            >
              New Password:
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '18px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                background: '#f8fafc',
                boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '17px',
                fontWeight: 600,
                marginTop: '10px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
