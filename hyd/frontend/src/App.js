import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './hide-scrollbar.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import ChangePassword from './pages/ChangePassword';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Shared Components
import BookRoom from './components/BookRoom';

// Super Admin
import SuperAdminHome from './superadmin/SuperAdminHome';
import SuperAdminDashboard from './superadmin/components/SuperAdminLandingPage';
import ManageRoles from './superadmin/components/ManageRoles';
import ViewAllAnnouncements from './superadmin/components/ViewAllAnnouncements';
import ViewAllBookings from './superadmin/components/ViewAllBookings';
import AllIssues from './superadmin/components/AllIssues';
import ManageRooms from './superadmin/components/ManageRooms';
import SuperAdminCalendar from './superadmin/components/SuperAdminCalendar';
import CreatePollPage from './superadmin/components/CreatePollPage';
import SuperAdminMyBookings from './superadmin/components/MyBookings';
import ManageRoleRequests from './superadmin/components/ManageRoleRequests';

// Admin
import AdminHome from './admin/AdminHome';
import AdminDashboard from './admin/components/AdminLandingPage';
import Announcements from './admin/components/Announcements';
import ViewBookings from './admin/components/ViewBookings';
import Calendar from './admin/components/Calendar';
import ViewIssues from './admin/components/ViewIssues';
import AddPool from './admin/components/AddPool';
import AdminMyBookings from './admin/components/MyBookings';

// Employee
import EmployeeHome from './employee/EmployeeHome';
import EmployeeDashboard from './employee/components/EmployeeLandingPage';
import EmpAnnouncements from './employee/components/Announcements';
import EmpCalendar from './employee/components/Calendar';
import RaiseIssue from './employee/components/RaiseIssue';
import EmployeeMyBookings from './employee/components/MyBookings';
import ViewPollsPage from './employee/components/ViewPollsPage';

const App = () => {
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh' }}>
        <Navbar />
        
        <div
          className="app-scroll-area"
          style={{
            minHeight: 'calc(100vh - 72px)',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'auto'
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<ProtectedRoute><SuperAdminHome /></ProtectedRoute>}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="manage-roles" element={<ManageRoles />} />
              <Route path="role-requests" element={<ManageRoleRequests />} />
              <Route path="book-room" element={<BookRoom />} />
              <Route path="my-bookings" element={<SuperAdminMyBookings />} />
              <Route path="all-bookings" element={<ViewAllBookings />} />
              <Route path="all-announcements" element={<ViewAllAnnouncements />} />
              <Route path="all-issues" element={<AllIssues />} />
              <Route path="manage-rooms" element={<ManageRooms />} />
              <Route path="calendar" element={<SuperAdminCalendar />} />
              <Route path="create-poll" element={<CreatePollPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminHome /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="book-room" element={<BookRoom />} />
              <Route path="my-bookings" element={<AdminMyBookings />} />
              <Route path="view-bookings" element={<ViewBookings />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="view-issues" element={<ViewIssues />} />
              <Route path="add-pool" element={<AddPool />} />
            </Route>

            {/* Employee Routes */}
            <Route path="/employee" element={<ProtectedRoute><EmployeeHome /></ProtectedRoute>}>
              <Route index element={<EmployeeDashboard />} />
              <Route path="announcements" element={<EmpAnnouncements />} />
              <Route path="book-room" element={<BookRoom />} />
              <Route path="my-bookings" element={<EmployeeMyBookings />} />
              <Route path="calendar" element={<EmpCalendar />} />
              <Route path="raise-issue" element={<RaiseIssue />} />
              <Route path="view-polls" element={<ViewPollsPage />} />
            </Route>

            {/* Fallback for unknown routes */}
            <Route path="*" element={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh',
                fontSize: '24px',
                color: '#666'
              }}>
                404 - Page Not Found
              </div>
            } />
          </Routes>
          
          <ToastContainer 
            position="top-right" 
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </div>
    </Router>
  );
};

export default App;
