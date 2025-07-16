import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const token = localStorage.getItem('token');

  const fetchRooms = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data);
    } catch (err) {
      alert('Failed to fetch rooms');
    }
  }, [token]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleAddRoom = async () => {
    if (!roomName.trim()) return alert('Enter a room name');
    try {
      await axios.post('http://localhost:5000/api/rooms', { name: roomName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomName('');
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add room');
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  // Improved CSS
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

  const inputStyle = {
    padding: '12px',
    width: '260px',
    borderRadius: '6px',
    border: '1px solid #bfc9d1',
    fontSize: '1rem',
    background: '#fff',
    transition: 'border 0.2s',
    outline: 'none'
  };

  const buttonStyle = {
    padding: '12px 28px',
    borderRadius: '7px',
    background: 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(25,118,210,0.07)',
    transition: 'background 0.2s, transform 0.1s'
  };

  const deleteButtonStyle = {
    padding: '7px 18px',
    background: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.1s'
  };

  return (
    <div style={contentContainerStyle}>
      <h2 style={{
        marginBottom: '28px',
        fontSize: '2.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#1976d2',
        fontWeight: 800,
        letterSpacing: '1px'
      }}>
        <span role="img" aria-label="rooms">🏢</span> Manage Rooms
      </h2>
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          style={inputStyle}
        />
        <button
          onClick={handleAddRoom}
          style={buttonStyle}
          onMouseOver={e => (e.target.style.background = '#0d47a1')}
          onMouseOut={e => (e.target.style.background = 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)')}
        >
          Add Room
        </button>
      </div>
      <div style={tableContainerStyle}>
        <style>
          {`
            /* Custom scrollbar for horizontal scroll */
            div[style*="overflow-x: auto"]::-webkit-scrollbar {
              height: 14px;
            }
            div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb {
              background: #bfc9d1;
              border-radius: 8px;
            }
            div[style*="overflow-x: auto"]::-webkit-scrollbar-track {
              background:rgb(250, 250, 252);
            }
            /* Table row hover effect */
            table tr:hover td {
              background:rgb(255, 255, 255);
              transition: background 0.2s;
            }
          `}
        </style>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#fff',
          border: '1px solid #e3e7ee'
        }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={cellHeader}>Room Name</th>
              <th style={cellHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room._id}>
                <td style={cell}>{room.name}</td>
                <td style={cell}>
                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    style={deleteButtonStyle}
                    onMouseOver={e => (e.target.style.background = '#b71c1c')}
                    onMouseOut={e => (e.target.style.background = '#d32f2f')}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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

export default ManageRooms;