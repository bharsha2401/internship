import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);

        const defaults = {};
        res.data.forEach((user) => {
          defaults[user._id] = user.role;
        });
        setSelectedRoles(defaults);
      } catch (err) {
        setMessage('❌ Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleAssignClick = async (id) => {
    const newRole = selectedRoles[id];
    try {
      await axios.put(
        `http://localhost:5000/api/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );

      setMessage(`✅ Role updated to ${newRole}`);
    } catch (err) {
      setMessage('❌ Failed to update role');
    }
  };

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
                <td colSpan={3} style={cell}>Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} style={cell}>No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td style={cell}>{user.email}</td>
                  <td style={cell}>
                    <select
                      value={selectedRoles[user._id]}
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
                      style={{
                        padding: '10px 28px',
                        background: 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '7px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25,118,210,0.07)',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => (e.target.style.background = '#0d47a1')}
                      onMouseOut={e => (e.target.style.background = 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)')}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRoles;
