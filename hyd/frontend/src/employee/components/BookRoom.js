// client/src/employee/components/BookRoom.js
import React, { useState } from 'react';

const BookRoom = () => {
  const [room, setRoom] = useState('');
  const [time, setTime] = useState('');

  const handleBooking = () => {
    alert(`Room "${room}" booked at ${time}`);
    setRoom('');
    setTime('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Book a Room</h3>
      <input
        type="text"
        placeholder="Room Name"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        style={{ padding: '10px', width: '300px', marginBottom: '10px', borderRadius: '4px' }}
      />
      <br />
      <input
        type="text"
        placeholder="Time Slot (e.g. 2PM - 3PM)"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={{ padding: '10px', width: '300px', marginBottom: '10px', borderRadius: '4px' }}
      />
      <br />
      <button onClick={handleBooking} style={{ padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
        Book
      </button>
    </div>
  );
};

export default BookRoom;
