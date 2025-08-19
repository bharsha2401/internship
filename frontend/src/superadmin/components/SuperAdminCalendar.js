import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';

const SuperAdminCalendar = () => {
  const [value, setValue] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/calendar/all');
      setEvents(res.data);
    } catch {
      alert('Error loading calendar events');
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const createdBy = localStorage.getItem('userId');
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/calendar/update/${editingId}`, {
          title,
          description: desc,
          date: value,
        });
      } else {
        await axios.post('http://localhost:5000/api/calendar/create', {
          title,
          description: desc,
          date: value,
          createdBy,
        });
      }
      setTitle('');
      setDesc('');
      setEditingId(null);
      fetchEvents();
    } catch {
      alert('Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setTitle(event.title);
    setDesc(event.description);
    setValue(new Date(event.date));
    setEditingId(event._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/calendar/delete/${id}`);
      fetchEvents();
    } catch {
      alert('Failed to delete event');
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toDateString();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        marginLeft: '230px',
        background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      className="hide-scrollbar"
    >
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          margin: '40px auto',
          background: '#fff',
          borderRadius: '18px',
          boxShadow: '0 4px 24px rgba(30,64,175,0.10)',
          padding: '40px 48px',
          minHeight: 'calc(100vh - 120px)',
          boxSizing: 'border-box'
        }}
      >
        <h2
          style={{
            marginBottom: '32px',
            textAlign: 'left',
            color: '#1a237e',
            fontWeight: 800,
            letterSpacing: '1px',
            fontSize: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span role="img" aria-label="calendar">🗓️</span> Super Admin Calendar
        </h2>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div style={{ flex: 1, minWidth: '320px', background: '#f8fafc', borderRadius: '12px', boxShadow: '0 1px 4px rgba(30,64,175,0.05)', padding: '18px' }}>
            <Calendar value={value} onChange={setValue} />
          </div>
          <form
            onSubmit={handleCreateOrUpdate}
            style={{
              flex: 1,
              minWidth: '320px',
              margin: 0,
              background: '#fff',
              padding: '24px 20px',
              borderRadius: '14px',
              boxShadow: '0 2px 12px rgba(30,64,175,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: '10px' }}>
              {editingId ? 'Edit Event' : 'Add Event'} on {value.toDateString()}
            </h3>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #bfc9d1',
                fontSize: '16px'
              }}
            />
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #bfc9d1',
                fontSize: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 28px',
                  background: 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(25,118,210,0.07)',
                  transition: 'background 0.2s'
                }}
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setDesc('');
                  }}
                  style={{
                    padding: '10px 28px',
                    background: '#888',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '7px',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        <h3 style={{
          fontSize: '1.3rem',
          color: '#1a237e',
          marginBottom: '18px',
          fontWeight: 600
        }}>
          Events on {value.toDateString()}:
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.filter(e => formatDate(e.date) === value.toDateString()).length === 0 ? (
            <p style={{ color: 'gray' }}>No events scheduled for this day.</p>
          ) : (
            events
              .filter(e => formatDate(e.date) === value.toDateString())
              .map((e, i) => (
                <div key={e._id} style={{
                  padding: '18px 22px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 4px rgba(30,64,175,0.04)',
                  border: '1px solid #e3e7ee'
                }}>
                  <div>
                    <strong style={{ color: '#1976d2', fontSize: '1.1rem' }}>{e.title}</strong>
                    <p style={{ margin: 0, color: '#333' }}>{e.description}</p>
                    <small style={{ color: '#888' }}>Created on: {new Date(e.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div>
                    <button
                      onClick={() => handleEdit(e)}
                      style={{
                        marginRight: '8px',
                        padding: '7px 18px',
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(e._id)}
                      style={{
                        padding: '7px 18px',
                        background: '#d32f2f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminCalendar;
