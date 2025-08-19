// client/src/pages/ContactAdmin.js
import React, { useState } from 'react';

const ContactAdmin = () => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    alert('Message sent to admin!');
    setMessage('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Contact Admin</h2>
      <textarea
        value={message}
        placeholder="Write your message..."
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '100%', height: '100px', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}
      ></textarea>
      <br />
      <button onClick={handleSend} style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
        Send
      </button>
    </div>
  );
};

export default ContactAdmin;
