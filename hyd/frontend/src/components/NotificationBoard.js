// client/src/components/NotificationBoard.js
import React from 'react';

const NotificationBoard = ({ notifications }) => {
  const containerStyle = {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
    marginTop: '20px'
  };

  const itemStyle = {
    borderBottom: '1px solid #ccc',
    padding: '10px 0'
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ marginBottom: '10px' }}>Notifications</h3>
      {notifications.length > 0 ? (
        notifications.map((note, index) => (
          <div key={index} style={itemStyle}>
            {note}
          </div>
        ))
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
  );
};

export default NotificationBoard;
