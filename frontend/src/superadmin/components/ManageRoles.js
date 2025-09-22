import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Derive API base URL with fallback to localhost if env var missing
const API_BASE = (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) || 'http://localhost:5000';
console.log('[ManageRoles] Using API base:', API_BASE);

const contentContainerStyle = {
  padding: '40px 24px',
  maxWidth: '1100px',
  margin: '40px auto',
  background: '#f7f8fa',
  minHeight: '100vh',
  boxSizing: 'border-box'
};

const tableContainerStyle = {
  background: '#fff',
  borderRadius: '16px',
  boxShadow: '0 2px 16px rgba(30,64,175,0.08)',
  padding: '0',
  marginTop: '32px',
  minHeight: 'unset',
  boxSizing: 'border-box',
  border: '1px solid #e3e7ee',
  overflowX: 'auto'
};

const cellHeader = {
  border: '1px solid #e3e7ee',
  padding: '16px',
  textAlign: 'center',
  fontSize: '1.08rem',
  fontWeight: 700,
  color: '#1a237e',
  background: '#f5f5f5'
};

const cell = {
  border: '1px solid #e3e7ee',
  padding: '14px',
  textAlign: 'center',
  fontSize: '1rem',
  background: '#fff'
};

const ManageRoles = () => {
  const [users, setUsers] = useState([]); // Initialize as empty array
  const [selectedRoles, setSelectedRoles] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('🔍 Fetching users from API...');
        const res = await axios.get(`${API_BASE}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('📊 API Response:', res.data);
        
        // Ensure we always have an array, regardless of API response structure
        let usersData = [];
        if (Array.isArray(res.data)) {
          usersData = res.data;
        } else if (res.data && Array.isArray(res.data.users)) {
          usersData = res.data.users;
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          usersData = res.data.data;
        } else {
          console.warn('⚠️ API response is not in expected format:', res.data);
          usersData = [];
        }
        
        console.log('👥 Users array:', usersData);
        setUsers(usersData);

        const defaults = {};
        if (Array.isArray(usersData)) {
          usersData.forEach((user) => {
            if (user && user._id) {
              defaults[user._id] = user.role || 'Employee';
            }
          });
        }
        setSelectedRoles(defaults);
        
        if (usersData.length === 0) {
          setMessage('⚠️ No users found in the system');
        } else {
          setMessage(''); // Clear any previous error messages
        }
      } catch (err) {
        console.error('❌ Error fetching users:', err);
        setMessage(`❌ Failed to load users: ${err.response?.data?.message || err.message}`);
        setUsers([]); // Always ensure users is an array
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    } else {
      setMessage('❌ No authentication token found');
      setLoading(false);
    }
  }, [token]);

  const handleAssignClick = async (id) => {
    const newRole = selectedRoles[id];
    if (!newRole) {
      setMessage('❌ Please select a role');
      return;
    }
    
    try {
      console.log(`🔄 Updating role for user ${id} to ${newRole}`);
      await axios.put(
        `${API_BASE}/api/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Safely update the users array
      setUsers((prev) => {
        if (!Array.isArray(prev)) {
          console.warn('⚠️ Previous users state is not an array:', prev);
          return prev;
        }
        return prev.map((u) => (u._id === id ? { ...u, role: newRole } : u));
      });
      
      setMessage(`✅ Role updated to ${newRole}`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Error updating role:', err);
      setMessage(`❌ Failed to update role: ${err.response?.data?.message || err.message}`);
    }
  };
  // ...existing code...
  return (
    <div style={contentContainerStyle}>
      <h2
        style={{
          marginBottom: '28px',
          textAlign: 'left',
          color: '#1976d2',
          fontWeight: 800,
          letterSpacing: '1px',
          fontSize: '2.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <span role="img" aria-label="lock">🔐</span> Manage User Roles
      </h2>
      {message && (
        <p
          style={{
            color: message.includes('✅') ? '#388e3c' : '#d32f2f',
            textAlign: 'left',
            fontWeight: 500,
            marginBottom: '18px'
          }}
        >
          {message}
        </p>
      )}
      <div style={tableContainerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e3e7ee' }}>
          <thead>
            <tr>
              <th style={cellHeader}>Email</th>
              <th style={cellHeader}>Role</th>
              <th style={cellHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={cell}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span>⏳</span> Loading users...
                  </div>
                </td>
              </tr>
            ) : !Array.isArray(users) ? (
              <tr>
                <td colSpan={3} style={cell}>
                  <div style={{ color: '#d32f2f' }}>
                    ❌ Error: Invalid data format received
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} style={cell}>
                  <div style={{ color: '#ff9800' }}>
                    📭 No users found in the system
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                // Safety check for each user object
                if (!user || !user._id) {
                  console.warn('⚠️ Invalid user object:', user);
                  return null;
                }
                
                return (
                  <tr key={user._id}>
                    <td style={cell}>{user.email || 'No email'}</td>
                    <td style={cell}>
                      <select
                        value={selectedRoles[user._id] || user.role || 'Employee'}
                        onChange={(e) =>
                          setSelectedRoles({ ...selectedRoles, [user._id]: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: '1px solid #bfc9d1',
                          fontSize: '1rem',
                          background: '#f7f8fa',
                          color: '#1a237e',
                          fontWeight: 500
                        }}
                      >
                        <option value="Employee">Employee</option>
                        <option value="Admin">Admin</option>
                        <option value="SuperAdmin">SuperAdmin</option>
                      </select>
                    </td>
                    <td style={cell}>
                      <button
                        onClick={() => handleAssignClick(user._id)}
                        disabled={!selectedRoles[user._id] || selectedRoles[user._id] === user.role}
                        style={{
                          padding: '10px 28px',
                          background: !selectedRoles[user._id] || selectedRoles[user._id] === user.role 
                            ? '#ccc' 
                            : 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '7px',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          cursor: !selectedRoles[user._id] || selectedRoles[user._id] === user.role 
                            ? 'not-allowed' 
                            : 'pointer',
                          boxShadow: '0 2px 8px rgba(25,118,210,0.07)',
                          transition: 'background 0.2s',
                          opacity: !selectedRoles[user._id] || selectedRoles[user._id] === user.role ? 0.6 : 1
                        }}
                        onMouseOver={e => {
                          if (!e.target.disabled) {
                            e.target.style.background = '#0d47a1';
                          }
                        }}
                        onMouseOut={e => {
                          if (!e.target.disabled) {
                            e.target.style.background = 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)';
                          }
                        }}
                      >
                        {selectedRoles[user._id] === user.role ? 'No Change' : 'Assign'}
                      </button>
                    </td>
                  </tr>
                );
              }).filter(Boolean) // Remove any null entries
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageRoles;
