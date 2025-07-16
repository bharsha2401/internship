import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewAllAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Event');
  const [editingId, setEditingId] = useState(null);
  const createdBy = localStorage.getItem('userId') || ''; // Remove setCreatedBy

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/announcements/all');
      setAnnouncements(res.data);
    } catch {
      toast.error('Failed to fetch announcements');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/announcements/update/${editingId}`, { title, message, type });
        toast.success('Announcement updated!');
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/api/announcements/create', { title, message, type, createdBy });
        toast.success('Announcement posted!');
      }
      setTitle('');
      setMessage('');
      setType('Event');
      fetchAnnouncements();
    } catch {
      toast.error('Failed to submit announcement');
    }
  };

  const handleEdit = (a) => {
    setTitle(a.title);
    setMessage(a.message);
    setType(a.type || 'Event');
    setEditingId(a._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/announcements/delete/${id}`);
      toast.error('Announcement deleted!');
      fetchAnnouncements();
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
      padding: '0',
      margin: '0'
    }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '48px 24px 24px 24px',
        minHeight: '100vh'
      }}>
        <h2 style={{
          fontSize: '2.2rem',
          fontWeight: 700,
          color: '#1a237e',
          marginBottom: '32px',
          letterSpacing: '1px'
        }}>
          {editingId ? 'Edit Announcement' : 'Post Announcement'}
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: '40px',
            background: '#fff',
            padding: '28px 32px',
            borderRadius: '14px',
            boxShadow: '0 4px 24px rgba(30,64,175,0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Title"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #bfc9d1',
              fontSize: '17px'
            }}
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Message"
            style={{
              width: '100%',
              padding: '12px',
              minHeight: '80px',
              borderRadius: '6px',
              border: '1px solid #bfc9d1',
              fontSize: '16px'
            }}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #bfc9d1',
              fontSize: '16px'
            }}
          >
            <option value="Holiday">🎉 Holiday</option>
            <option value="Event">📅 Event</option>
            <option value="Alert">⚠️ Alert</option>
            <option value="Recognition">🏆 Recognition</option>
          </select>
          <button
            type="submit"
            style={{
              padding: '12px 0',
              background: 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '7px',
              fontWeight: 700,
              fontSize: '17px',
              marginTop: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25,118,210,0.07)'
            }}
          >
            {editingId ? 'Update' : 'Post'}
          </button>
        </form>

        <h3 style={{
          fontSize: '1.5rem',
          color: '#1a237e',
          marginBottom: '18px',
          fontWeight: 600
        }}>
          All Announcements
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {announcements.map((a) => (
            <div key={a._id} style={{
              background: '#fff',
              borderRadius: '10px',
              boxShadow: '0 2px 12px rgba(30,64,175,0.08)',
              padding: '22px 20px 18px 20px',
              border: '1px solid #e3e7ee',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{
                  marginBottom: '8px',
                  color: '#1976d2',
                  fontWeight: 700,
                  fontSize: '1.18rem'
                }}>
                  {getIcon(a.type)} {a.title}
                </h4>
                <p style={{ color: '#333', marginBottom: '10px' }}>{a.message}</p>
                <small style={{ color: '#888' }}>
                  Posted on {new Date(a.createdAt).toLocaleString()}
                </small>
              </div>
              <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleEdit(a)}
                  style={{
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
                  onClick={() => handleDelete(a._id)}
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
          ))}
        </div>
      </div>
    </div>
  );
};

const getIcon = (type) => {
  switch (type) {
    case 'Holiday': return '🎉';
    case 'Event': return '📅';
    case 'Alert': return '⚠️';
    case 'Recognition': return '🏆';
    default: return '';
  }
};

export default ViewAllAnnouncements;
