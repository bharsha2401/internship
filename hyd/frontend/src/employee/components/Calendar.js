import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';

const EmployeeCalendar = () => {
  const [value, setValue] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
  axios.get(`${process.env.REACT_APP_API_URL}/api/calendar/all`).then(res => setEvents(res.data));
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 0'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          background: '#fff',
          borderRadius: '18px',
          boxShadow: '0 4px 24px rgba(30,64,175,0.10)',
          padding: '40px 48px',
          margin: '0 auto'
        }}
      >
        <h2 style={{
          fontSize: '2.2rem',
          fontWeight: 700,
          color: '#1976d2',
          marginBottom: '28px',
          letterSpacing: '1px'
        }}>
          📅 Company Calendar
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <Calendar
            value={value}
            onChange={setValue}
            tileClassName={({ date, view }) => {
              // Highlight days with events
              if (
                events.some(
                  e => new Date(e.date).toDateString() === date.toDateString()
                )
              ) {
                return 'event-day';
              }
              return null;
            }}
          />
        </div>
        <h3 style={{
          fontSize: '1.3rem',
          color: '#1a237e',
          marginBottom: '16px',
          fontWeight: 600
        }}>
          Events on {value.toLocaleDateString()}
        </h3>
        <div>
          {events.filter(e => new Date(e.date).toDateString() === value.toDateString()).length === 0 ? (
            <p style={{ color: '#888', fontSize: '1.1rem' }}>No events for this day.</p>
          ) : (
            events
              .filter(e => new Date(e.date).toDateString() === value.toDateString())
              .map(e => (
                <div
                  key={e._id}
                  style={{
                    border: '1px solid #e3e9ee',
                    borderRadius: '10px',
                    padding: '18px 20px',
                    background: '#f8fafc',
                    marginBottom: '14px',
                    boxShadow: '0 2px 8px rgba(30,64,175,0.08)'
                  }}
                >
                  <strong style={{ color: '#1976d2', fontSize: '1.1rem' }}>{e.title}</strong>
                  <div style={{ color: '#333', marginTop: '4px' }}>{e.description}</div>
                  <small style={{ color: '#888' }}>
                    {new Date(e.date).toLocaleString()}
                  </small>
                </div>
              ))
          )}
        </div>
      </div>
      <style>
        {`
          /* Highlight event days in calendar */
          .event-day {
            background: #1976d2 !important;
            color: #fff !important;
            border-radius: 50% !important;
          }
          .react-calendar {
            border-radius: 14px;
            border: 1px solid #e3e9ee;
            box-shadow: 0 2px 12px rgba(30,64,175,0.08);
            margin-bottom: 18px;
          }
          .react-calendar__tile--active {
            background: #00bfff !important;
            color: #fff !important;
            border-radius: 50% !important;
          }
          .react-calendar__tile--now {
            background: #e3e9f7 !important;
            color: #1976d2 !important;
            border-radius: 50% !important;
          }
        `}
      </style>
    </div>
  );
};

export default EmployeeCalendar;
