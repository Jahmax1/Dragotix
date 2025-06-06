import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import TicketVerification from './pages/TicketVerification';

// Simple NotFound component for 404 routes
const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">Go to Home</a>
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route element={<RoleProtectedRoute allowedRole="user" />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRole="organizer" />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/verify-tickets/:eventId" element={<TicketVerification />} />
            </Route>
          </Route>
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}