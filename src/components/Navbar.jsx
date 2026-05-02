import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut, LayoutDashboard, Menu, X, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavLinks = ({ variant = 'desktop', onGoHome, onGoCaretakers, onGoContact, onGoSection }) => {
  const linkStyle = variant === 'desktop'
    ? { fontWeight: 500, color: '#374151', fontSize: '0.95rem' }
    : { fontWeight: 600, color: '#111827', fontSize: '1rem', padding: '0.75rem 0.25rem' };

  return (
    <>
      <button type="button" onClick={onGoHome} className="btn-link" style={linkStyle}>Home</button>
      <button type="button" onClick={onGoCaretakers} className="btn-link" style={linkStyle}>Find Caretakers</button>
      <button type="button" onClick={() => onGoSection('services')} className="btn-link" style={linkStyle}>Services</button>
      <button type="button" onClick={() => onGoSection('how-it-works')} className="btn-link" style={linkStyle}>How It Works</button>
      <button type="button" onClick={onGoContact} className="btn-link" style={linkStyle}>Contact Us</button>
    </>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleColor = { admin: '#7C3AED', caretaker: '#1D4ED8', client: '#10B981' };

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
  };

  const goToSection = (id) => {
    navigate(`/#${id}`);
    setOpen(false);
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid #EDE9FE',
      boxShadow: '0 1px 12px rgba(124,58,237,0.06)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Heart size={20} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            buddy<span className="text-gradient">ofcare</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <NavLinks
            variant="desktop"
            onGoHome={() => goTo('/')}
            onGoCaretakers={() => goTo('/caretakers')}
            onGoContact={() => goTo('/contact')}
            onGoSection={goToSection}
          />
        </div>

        {/* Auth Buttons */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: '2rem', background: '#F5F3FF', fontSize: '0.85rem', fontWeight: 600, color: roleColor[user.role] || '#7C3AED' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>
                  {user.full_name?.charAt(0)}
                </div>
                {user.full_name?.split(' ')[0]}
                <span style={{ background: '#EDE9FE', color: '#6D28D9', padding: '0.1rem 0.5rem', borderRadius: '99px', fontSize: '0.7rem', textTransform: 'capitalize' }}>{user.role}</span>
              </div>
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setOpen(!open)} className="btn btn-icon btn-secondary show-mobile-btn" aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

        {/* Mobile menu */}
      {open && (
        <div className="show-mobile" style={{ borderTop: '1px solid #EDE9FE', background: 'rgba(255,255,255,0.96)' }}>
          <div className="container" style={{ paddingTop: '1rem', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <NavLinks
                variant="mobile"
                onGoHome={() => goTo('/')}
                onGoCaretakers={() => goTo('/caretakers')}
                onGoContact={() => goTo('/contact')}
                onGoSection={goToSection}
              />
              <div style={{ height: '1px', background: '#EDE9FE', margin: '0.75rem 0' }} />
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button type="button" onClick={() => goTo('/dashboard')} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <button onClick={handleLogout} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button type="button" onClick={() => goTo('/login')} className="btn btn-secondary" style={{ justifyContent: 'center' }}>Sign In</button>
                  <button type="button" onClick={() => goTo('/register')} className="btn btn-primary" style={{ justifyContent: 'center' }}>Get Started</button>
                  <button type="button" onClick={() => goTo('/contact')} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                    <PhoneCall size={16} /> Contact Support
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
