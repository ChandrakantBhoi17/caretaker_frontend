import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Briefcase, 
  Heart,
  MapPin,
  Clock,
  Star,
  ArrowLeft
} from 'lucide-react';
import { authService, caretakerService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'client'
  });
  
  // Caretaker specific data
  const [caretakerData, setCaretakerData] = useState({
    bio: '',
    experience_years: 0,
    wages_price: 20.0,
    specialties: '',
    location: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.role === 'client') {
      handleSubmit(e);
    } else {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Register User
      const user = await authService.register(formData);
      
      // 2. If caretaker, login immediately and create profile with valid auth.
      if (formData.role === 'caretaker') {
        await login({ email: formData.email, password: formData.password });
        await caretakerService.create({
          ...caretakerData,
          user_id: user.id
        });
        navigate('/dashboard');
        return;
      }
      
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', background: '#F8F7FF' }}>
      {/* Back to Home */}
      <Link 
        to="/" 
        style={{ 
          position: 'absolute', 
          top: '2rem', 
          left: '2rem', 
          zIndex: 100, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--primary)', 
          fontWeight: 700,
          background: 'rgba(124, 58, 237, 0.05)',
          padding: '0.6rem 1.2rem',
          borderRadius: '99px',
          border: '1px solid rgba(124, 58, 237, 0.1)'
        }}
        className="back-to-home"
      >
        <ArrowLeft size={20} /> Back to Home
      </Link>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card auth-card" 
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {step === 1 ? 'Join buddyofcare.com' : 'Complete Profile'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {step === 1 ? 'Start your journey with us today' : 'Tell us about your professional experience'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#FEF2F2', 
            color: '#B91C1C', 
            padding: '1rem', 
            borderRadius: '0.75rem', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={step === 1 ? handleNext : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {step === 1 ? (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', outline: 'none' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', outline: 'none' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', outline: 'none' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>I want to...</label>
                <div className="auth-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div 
                    onClick={() => setFormData({...formData, role: 'client'})}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '0.75rem', 
                      border: `2px solid ${formData.role === 'client' ? 'var(--primary)' : '#E2E8F0'}`,
                      background: formData.role === 'client' ? '#F5F3FF' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Heart size={24} color={formData.role === 'client' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Find Care</span>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, role: 'caretaker'})}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '0.75rem', 
                      border: `2px solid ${formData.role === 'caretaker' ? 'var(--primary)' : '#E2E8F0'}`,
                      background: formData.role === 'caretaker' ? '#F5F3FF' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Briefcase size={24} color={formData.role === 'caretaker' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Offer Care</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '1rem' }}>
                {formData.role === 'caretaker' ? 'Continue' : 'Sign Up'}
                <ArrowRight size={20} />
              </button>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Professional Bio</label>
                <textarea 
                  placeholder="Describe your experience and care approach..."
                  value={caretakerData.bio}
                  onChange={(e) => setCaretakerData({...caretakerData, bio: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', outline: 'none', height: '100px', resize: 'none' }} 
                />
              </div>

              <div className="auth-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Exp. Years</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="number" 
                      value={caretakerData.experience_years}
                      onChange={(e) => setCaretakerData({...caretakerData, experience_years: parseInt(e.target.value)})}
                      required
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', outline: 'none' }} 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Wages Price (₹/day)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 900 }}>₹</span>
                    <input 
                      type="number" 
                      step="0.1"
                      value={caretakerData.wages_price}
                      onChange={(e) => setCaretakerData({...caretakerData, wages_price: parseFloat(e.target.value)})}
                      required
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', outline: 'none' }} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="City, State"
                    value={caretakerData.location}
                    onChange={(e) => setCaretakerData({...caretakerData, location: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', outline: 'none' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Specialties (comma separated)</label>
                <div style={{ position: 'relative' }}>
                  <Star size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Elderly Care, Cooking, First Aid..."
                    value={caretakerData.specialties}
                    onChange={(e) => setCaretakerData({...caretakerData, specialties: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', outline: 'none' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                  {loading ? 'Creating Profile...' : 'Complete Signup'}
                  <ArrowRight size={20} />
                </button>
              </div>
            </>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log In</Link>
        </p>
      </motion.div>

      <style>{`
        .auth-card {
          width: 100%;
          max-width: 550px;
          padding: 3rem;
          background: white;
          border-radius: 2rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        @media (max-width: 600px) {
          .auth-card { 
            padding: 2rem 1.25rem !important; 
            border-radius: 1.5rem !important;
            margin: 0;
            max-width: 100%;
          }
          .auth-grid-2 { grid-template-columns: 1fr !important; }
          h2 { font-size: 1.75rem !important; }
          .back-to-home {
            top: 1rem !important;
            left: 1rem !important;
            padding: 0.5rem 1rem !important;
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
