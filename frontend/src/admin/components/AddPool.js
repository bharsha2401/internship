import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreatePollPage = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [polls, setPolls] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/polls/all');
      setPolls(res.data);
    } catch {
      setPolls([]);
    }
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleEdit = (poll) => {
    setEditingId(poll._id);
    setQuestion(poll.question);
    setOptions(poll.options.map(opt => opt.text));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const createdBy = localStorage.getItem('userId');
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/polls/${editingId}`,
          {
            question,
            options: options.filter(opt => opt.trim() !== ''),
            createdBy
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              role: role
            }
          }
        );
        toast.success('Poll updated!');
        setEditingId(null);
      } else {
        await axios.post(
          'http://localhost:5000/api/polls/create',
          {
            question,
            options: options.filter(opt => opt.trim() !== ''),
            createdBy
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              role: role
            }
          }
        );
        toast.success('Poll created!');
      }
      setQuestion('');
      setOptions(['', '']);
      fetchPolls();
    } catch (err) {
      toast.error('Failed to submit poll');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!window.confirm('Are you sure you want to delete this poll?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/polls/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          role: role
        }
      });
      toast.error('Poll deleted successfully!');
      fetchPolls();
    } catch (err) {
      toast.error('Failed to delete poll');
    }
  };

  const handleVote = async (pollId, optionIdx) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    try {
      await axios.post(
        `http://localhost:5000/api/polls/vote/${pollId}/${optionIdx}`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            role: role
          }
        }
      );
      toast.success('Vote submitted!');
      fetchPolls();
    } catch (err) {
      toast.error('Failed to submit vote');
    }
  };

  return (
    <div style={{
      margin: '40px auto',
      maxWidth: '700px',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(30,64,175,0.10)',
      padding: '40px 32px',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#1976d2', marginBottom: '24px' }}>{editingId ? 'Edit Poll' : 'Add Pool'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Poll question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
          style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #bfc9d1', fontSize: '16px' }}
        />
        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={e => handleOptionChange(idx, e.target.value)}
            required
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #bfc9d1', fontSize: '16px' }}
          />
        ))}
        <button type="button" onClick={handleAddOption} style={{ marginBottom: '16px' }}>
          Add Option
        </button>
        <br />
        <button type="submit" style={{
          padding: '12px 32px',
          background: 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '7px',
          fontWeight: 700,
          fontSize: '16px',
          cursor: 'pointer'
        }}>
          {editingId ? 'Update Poll' : 'Create Poll'}
        </button>
      </form>
      {polls.length === 0 ? (
        <p style={{ color: '#888' }}>No polls available.</p>
      ) : (
        polls.map((poll) => (
          <div key={poll._id} style={{
            marginBottom: '24px',
            padding: '18px',
            border: '1px solid #e3e9ee',
            borderRadius: '10px',
            background: '#f8fafc',
            textAlign: 'left'
          }}>
            <strong style={{ fontSize: '1.1rem', color: '#1976d2' }}>{poll.question}</strong>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
              {poll.options.map((opt, idx) => (
                <li key={idx} style={{ marginBottom: '6px', color: '#333' }}>
                  {opt.text} <span style={{ color: '#1976d2', fontWeight: 600 }}>({opt.votes.length} votes)</span>
                  <button
                    onClick={() => handleVote(poll._id, idx)}
                    style={{
                      marginLeft: '12px',
                      padding: '4px 12px',
                      background: '#43a047',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: '0.95em'
                    }}
                  >
                    Vote
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleEdit(poll)}
              style={{
                marginTop: '8px',
                padding: '7px 18px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(poll._id)}
              style={{
                marginTop: '8px',
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
        ))
      )}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default CreatePollPage;