import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaLinkedin } from 'react-icons/fa';

const About = () => {
  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '40px',
          borderRadius: '10px',
          margin: '40px auto',
          maxWidth: '1000px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          backgroundColor: '#ffffff',
          lineHeight: 1.7,
          flex: 1
        }}
      >
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#1d3557',
            borderBottom: '3px solid #457b9d',
            paddingBottom: '10px'
          }}
        >
          About Us
        </h1>

        <p style={{ fontSize: '18px', marginBottom: '20px', color: '#343a40' }}>
          <strong>Welcome to the INCOR Group Employee Communication Portal</strong> – a centralized platform
          designed to enhance communication, collaboration, and efficiency across our organization.
        </p>

        <p style={{ fontSize: '17px', marginBottom: '20px', color: '#495057' }}>
          This portal serves as a bridge between employees, administrators, and management, helping streamline
          everyday interactions and improve workplace coordination. It empowers employees to stay updated with
          announcements, book meeting rooms, raise issues, view calendar events, and submit feedback — all in
          one place.
        </p>

        <div
          style={{
            backgroundColor: '#f1f1f1',
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            marginBottom: '25px'
          }}
        >
          <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Portal Roles:</h3>
          <ul style={{ listStyle: 'square', paddingLeft: '20px', fontSize: '16px', color: '#212529' }}>
            <li><strong>Employees:</strong> View updates, manage bookings, raise support requests, and participate in polls.</li>
            <li><strong>Admins:</strong> Post announcements, assign tasks, manage issues, and oversee calendar events.</li>
            <li><strong>Super Admins:</strong> Assign roles, manage rooms, and access all data dashboards.</li>
          </ul>
        </div>

        <p style={{ fontSize: '17px', color: '#495057' }}>
          This platform is built using the modern <strong>MERN stack</strong> (MongoDB, Express.js, React.js, Node.js),
          ensuring a secure, scalable, and responsive experience.
        </p>

        <p style={{ fontSize: '17px', color: '#495057' }}>
          At INCOR Group, we believe that strong internal communication is key to organizational success.
          This portal is a step forward in building a transparent, collaborative, and digitally empowered workplace.
        </p>

        <p style={{ fontStyle: 'italic', color: '#6c757d', marginTop: '30px', fontSize: '16px' }}>
          We’re glad to have you on board — connected, informed, and involved.
        </p>
      </div>

      {/* Footer */}
      <div style={{ background: 'linear-gradient(to right, #2ecc71, #27ae60)', height: '8px' }}></div>
      <footer
        style={{
          backgroundColor: '#212529',
          color: '#ffffff',
          padding: '40px 20px',
          textAlign: 'center'
        }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Incor_logo.png/240px-Incor_logo.png"
          alt="Incor Logo"
          style={{ width: '120px', marginBottom: '15px' }}
        />

        <p style={{ margin: '10px 0', fontSize: '15px' }}>INCOR Infrastructure Pvt. Ltd.</p>
        <p style={{ margin: '10px 0', fontSize: '15px' }}>
          Plot # 69 & 70, Kavuri Hills,<br />
          Madhapur, Hyderabad - 500 033
        </p>
        <p style={{ margin: '10px 0' }}>
          <FaPhoneAlt /> &nbsp; ‪+91 40-6818-1800‬
        </p>
        <p style={{ margin: '10px 0' }}>
          <FaEnvelope /> &nbsp; info@incor.in
        </p>
        <p style={{ margin: '10px 0' }}>
          <FaLinkedin /> &nbsp; Incor Group
        </p>
      </footer>
    </div>
  );
};

export default About;