import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Announcements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Event');
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchAnnouncements = async () => {
    const res = await axios.get('http://localhost:5000/api/announcements/all');
    setAnnouncements(res.data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const createdBy = localStorage.getItem('userId');

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
    } catch (error) {
      toast.error('Failed to submit announcement');
    }
  };

  const handleEdit = (a) => {
    setTitle(a.title);
    setMessage(a.message);
    setType(a.type);
    setEditingId(a._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/announcements/delete/${id}`);
    toast.error('Announcement deleted!');
    fetchAnnouncements();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        maxWidth: '700px',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <ToastContainer />
      <h2
        style={{
          fontSize: '24px',
          marginBottom: '20px',
          color: '#333'
        }}
      >
        {editingId ? 'Edit Announcement' : 'Post Announcement'}
      </h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Title"
          style={{
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Message"
          style={{
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '16px',
            minHeight: '100px',
            resize: 'vertical'
          }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          style={{
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
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
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {editingId ? 'Update' : 'Post'}
        </button>
      </form>

      <h3
        style={{
          marginTop: '40px',
          marginBottom: '15px',
          fontSize: '20px',
          color: '#444'
        }}
      >
        All Announcements
      </h3>

      {announcements.map((a) => (
        <div
          key={a._id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <h4
            style={{
              margin: '0 0 8px 0',
              fontSize: '18px'
            }}
          >
            {getIcon(a.type)} {a.title}
          </h4>
          <p style={{ margin: '0 0 10px 0' }}>{a.message}</p>
          <div>
            <button
              onClick={() => handleEdit(a)}
              style={{
                marginRight: '10px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#ffc107',
                color: '#333',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(a._id)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#dc3545',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const getIcon = (type) => {
  switch (type) {
    case 'Holiday':
      return '🎉';
    case 'Event':
      return '📅';
    case 'Alert':
      return '⚠️';
    case 'Recognition':
      return '🏆';
    default:
      return '';
  }
};

export default Announcements;
