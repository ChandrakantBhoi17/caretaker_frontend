import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Caretakers from './pages/client/Caretakers';
import BookingPage from './pages/client/BookingPage';
import CaretakerProfile from './pages/client/CaretakerProfile';
import ClientDashboard from './pages/client/ClientDashboard';
import CaretakerDashboard from './pages/caretaker/CaretakerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContactUs from './pages/ContactUs';

// Route guards
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}><div className="spinner" /></div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Auto-route to role-specific dashboard
const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'caretaker') return <CaretakerDashboard />;
  return <ClientDashboard />;
};

const ScrollToHash = () => {
  const location = useLocation();
  React.useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const id = location.hash.replace('#', '');
    // Give the DOM a tick to paint the target section.
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, [location.pathname, location.hash]);
  return null;
};

const AppRoutes = () => {
  const location = useLocation();
  const noNavbarPaths = ['/login', '/register'];
  const showNavbar = !noNavbarPaths.includes(location.pathname);

  return (
    <>
      <ScrollToHash />
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/caretakers" element={<Caretakers />} />
        <Route path="/caretaker/:id" element={<CaretakerProfile />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Auth-only public */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected */}
        <Route path="/book/:id" element={<ProtectedRoute roles={['client']}><BookingPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
