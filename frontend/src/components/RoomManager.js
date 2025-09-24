import React, { useEffect, useState } from 'react';
import apiClient from '../apiClient';

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await apiClient.get('/api/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const handleAddRoom = async () => {
    if (!roomName.trim()) return alert('Enter a room name');
    try {
      await apiClient.post('/api/rooms', { name: roomName });
      setRoomName('');
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add room');
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await apiClient.delete(`/api/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Room Manager</h3>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          style={{ padding: '8px', width: '300px', borderRadius: '4px' }}
        />
        <button onClick={handleAddRoom} style={btnStyle}>Add Room</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={cell}>Room Name</th>
            <th style={cell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room._id}>
              <td style={cell}>{room.name}</td>
              <td style={cell}>
                <button
                  onClick={() => handleDeleteRoom(room._id)}
                  style={{ ...btnStyle, backgroundColor: 'crimson' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const cell = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center'
};

const btnStyle = {
  padding: '8px 16px',
  backgroundColor: '#333',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default RoomManager;
