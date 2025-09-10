import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import SuperAdminSidebar from '../superadmin/components/Sidebar';
import AdminSidebar from '../admin/components/Sidebar';
import EmployeeSidebar from '../employee/components/Sidebar';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    gender: '',
    dob: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    picture: ''
  });
  const [editing, setEditing] = useState(false);
  const role = localStorage.getItem('role');

  // Choose sidebar based on role
  let Sidebar = null;
  if (role === 'SuperAdmin') Sidebar = SuperAdminSidebar;
  else if (role === 'Admin') Sidebar = AdminSidebar;
  else if (role === 'Employee') Sidebar = EmployeeSidebar;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Split phone into country code and number if possible
        let phoneCountryCode = '+91';
        let phoneNumber = '';
        if (res.data.phone) {
          const match = res.data.phone.match(/^(\+\d{1,3})(\d{10})$/);
          if (match) {
            phoneCountryCode = match[1];
            phoneNumber = match[2];
          } else {
            phoneNumber = res.data.phone;
          }
        }
        setProfile({
          ...res.data,
          phoneCountryCode,
          phoneNumber
        });
      } catch {
        setProfile({
          name: localStorage.getItem('name') || '',
          email: localStorage.getItem('email') || '',
          role: localStorage.getItem('role') || '',
          gender: '',
          dob: '',
          phoneCountryCode: '+91',
          phoneNumber: '',
          picture: ''
        });
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneCountryCode') {
      // Only allow + and up to 3 digits
      let val = value.replace(/[^+\d]/g, '');
      if (!val.startsWith('+')) val = '+' + val;
      val = val.slice(0, 4);
      setProfile({ ...profile, phoneCountryCode: val });
    } else if (name === 'phoneNumber') {
      // Only allow digits, max 10
      let val = value.replace(/\D/g, '').slice(0, 10);
      setProfile({ ...profile, phoneNumber: val });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('gender', profile.gender);
    formData.append('dob', profile.dob);
    // Combine country code and number for backend
    formData.append('phone', profile.phoneCountryCode + profile.phoneNumber);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
      // Refresh profile data
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let phoneCountryCode = '+91';
      let phoneNumber = '';
      if (res.data.phone) {
        const match = res.data.phone.match(/^(\+\d{1,3})(\d{10})$/);
        if (match) {
          phoneCountryCode = match[1];
          phoneNumber = match[2];
        } else {
          phoneNumber = res.data.phone;
        }
      }
      setProfile({
        ...res.data,
        phoneCountryCode,
        phoneNumber
      });
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f8fb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Segoe UI, Arial, sans-serif'
    }}>
      {Sidebar && <Sidebar />}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div
          style={{
            maxWidth: '600px',
            width: '100%',
            background: '#fff', // White box
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(30,64,175,0.10)',
            padding: '56px 48px',
            margin: '40px 0'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{
              margin: '10px 0',
              color: '#0d47a1', // Deep blue theme
              fontWeight: 700,
              fontSize: '2.2rem',
              letterSpacing: '1px'
            }}>
              {profile.name || 'No name'}
            </h2>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#43a047', // Admin color changed to green
                color: '#fff',
                borderRadius: '10px',
                padding: '6px 18px',
                fontSize: '1.08rem',
                marginBottom: '10px',
                fontWeight: 600
              }}
            >
              {profile.role || 'N/A'}
            </span>
          </div>

          {editing ? (
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                background: '#f8fafc',
                borderRadius: '10px',
                padding: '28px',
                boxShadow: '0 1px 8px rgba(30,64,175,0.08)'
              }}
            >
              <label style={{ fontWeight: 500, color: '#1976d2', marginBottom: '4px' }}>Full Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Full Name"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  background: '#f8fafc',
                  boxSizing: 'border-box'
                }}
              />
              <label style={{ fontWeight: 500, color: '#1976d2', marginBottom: '4px' }}>Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  background: '#f8fafc',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <label style={{ fontWeight: 500, color: '#1976d2', marginBottom: '4px' }}>Date of Birth</label>
              <input
                name="dob"
                type="date"
                value={profile.dob ? profile.dob.split('T')[0] : ''}
                onChange={handleChange}
                placeholder="Enter your date of birth"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  background: '#f8fafc',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 1px 4px rgba(25,118,210,0.09)'
                }}
              >
                Save
              </button>
            </form>
          ) : (
            <div style={{
              lineHeight: '2',
              color: '#444',
              fontSize: '1.13rem',
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '28px',
              boxShadow: '0 1px 8px rgba(30,64,175,0.08)'
            }}>
              <p>
                <strong style={{ color: '#1976d2' }}>Email:</strong> {profile.email || 'N/A'}
              </p>
              <p>
                <strong style={{ color: '#1976d2' }}>Gender:</strong> {profile.gender || 'N/A'}
              </p>
              <p>
                <strong style={{ color: '#1976d2' }}>Date of Birth:</strong>{' '}
                {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
              </p>
              <button
                onClick={() => setEditing(true)}
                style={{
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  marginTop: '14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '16px',
                  boxShadow: '0 1px 4px rgba(25,118,210,0.09)'
                }}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
