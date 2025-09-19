import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/announcements/view`)
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error(err));

    axios.get(`${process.env.REACT_APP_API_URL}/api/employees/birthdays`)
      .then((res) => setBirthdays(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setBirthdays([]));
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
        padding: '0',
        margin: '0'
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '48px 24px 24px 24px',
          minHeight: '100vh'
        }}
      >
        <h2
          style={{
            fontSize: '2.2rem',
            fontWeight: 700,
            color: '#1a237e',
            marginBottom: '32px',
            letterSpacing: '1px'
          }}
        >
          📢 Latest Announcements
        </h2>

        {/* Birthday Greetings */}
        {birthdays.length > 0 && (
          <div>
            <h4>🎂 Birthday Greetings!</h4>
            <ul>
              {birthdays.map((emp) => (
                <li key={emp._id}>
                  Happy Birthday <strong>{emp.name}</strong>! 🎉
                </li>
              ))}
            </ul>
          </div>
        )}

        {announcements.length === 0 ? (
          <p style={{ color: '#888', fontSize: '1.1rem', textAlign: 'center' }}>No announcements available.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '22px'
          }}>
            {announcements.map((a) => (
              <div
                key={a._id}
                style={{
                  border: '1px solid #e3e9ee',
                  borderRadius: '14px',
                  padding: '28px 24px 18px 24px',
                  background: '#fff',
                  boxShadow: '0 2px 12px rgba(30,64,175,0.08)',
                  transition: 'box-shadow 0.18s, transform 0.18s',
                  cursor: 'pointer'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(25,118,210,0.13)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(30,64,175,0.08)';
                }}
              >
                <h4 style={{
                  marginBottom: '8px',
                  color: '#1976d2',
                  fontWeight: 700,
                  fontSize: '1.18rem'
                }}>
                  {a.title}
                </h4>
                <p style={{ color: '#333', marginBottom: '10px' }}>{a.message}</p>
                <small style={{ color: '#888' }}>
                  Posted on {new Date(a.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
