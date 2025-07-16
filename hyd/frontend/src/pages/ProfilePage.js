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
    picture: ''
  });
  const [editing, setEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch {
        setProfile({
          name: localStorage.getItem('name') || '',
          email: localStorage.getItem('email') || '',
          role: localStorage.getItem('role') || '',
          gender: '',
          dob: '',
          picture: ''
        });
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('gender', profile.gender);
    formData.append('dob', profile.dob);
    if (selectedFile) {
      formData.append('picture', selectedFile);
    }
    try {
      await axios.put('http://localhost:5000/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
      setSelectedFile(null);
      
      // Refresh profile data
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      
      // Trigger navbar profile picture refresh
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
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
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            padding: '40px 30px',
            fontFamily: 'Segoe UI, sans-serif'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : profile.picture 
                    ? `http://localhost:5000${profile.picture}` 
                    : '/default-profile.png'
              }
              alt="Profile"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #007bff',
                marginBottom: 12
              }}
            />
            <h2 style={{ margin: '10px 0', color: '#333' }}>
              {profile.name || 'No name'}
            </h2>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#007bff',
                color: '#fff',
                borderRadius: '12px',
                padding: '4px 12px',
                fontSize: '0.85rem',
                marginBottom: '12px'
              }}
            >
              {profile.role || 'N/A'}
            </span>
          </div>

          {editing ? (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Full Name"
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                name="dob"
                type="date"
                value={profile.dob ? profile.dob.split('T')[0] : ''}
                onChange={handleChange}
                placeholder="Enter your date of birth"
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#28a745',
                  color: '#fff',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </form>
          ) : (
            <div style={{ lineHeight: '1.8', color: '#555', fontSize: '0.95rem' }}>
              <p>
                <strong>Email:</strong> {profile.email || 'N/A'}
              </p>
              <p>
                <strong>Gender:</strong> {profile.gender || 'N/A'}
              </p>
              <p>
                <strong>Date of Birth:</strong>{' '}
                {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
              </p>
              <button
                onClick={() => setEditing(true)}
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '6px',
                  marginTop: '12px',
                  cursor: 'pointer'
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
