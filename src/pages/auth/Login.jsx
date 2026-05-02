import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, Heart, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'url("/assets/images/login_bg.png") center/cover no-repeat',
      position: 'relative',
      padding: '1.5rem'
    }}>
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
          color: 'white', 
          fontWeight: 700,
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          background: 'rgba(255,255,255,0.1)',
          padding: '0.6rem 1.2rem',
          borderRadius: '99px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
        className="back-to-home"
      >
        <ArrowLeft size={20} /> Back to Home
      </Link>

      {/* Overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(30, 58, 138, 0.4) 100%)',
        backdropFilter: 'blur(2px)'
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="login-container"
      >
        {/* Left Side: Branding */}
        <div className="login-branding-side hide-mobile">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{ 
              background: 'var(--primary)', 
              width: 'clamp(48px, 5vw, 64px)', 
              height: 'clamp(48px, 5vw, 64px)', 
              borderRadius: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2.5rem',
              boxShadow: '0 10px 20px rgba(124, 58, 237, 0.3)'
            }}>
              <Heart size={28} fill="white" color="white" />
            </div>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
              fontWeight: 800, 
              color: '#1e1b4b', 
              lineHeight: 1.1, 
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}>
              Welcome Back to <span className="text-gradient">buddyofcare.com</span>
            </h1>
            <p style={{ 
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)', 
              color: '#4b5563', 
              lineHeight: 1.6, 
              maxWidth: '400px', 
              marginBottom: '3.5rem' 
            }}>
              Connect with verified caretakers or manage your service requests with ease and compassion.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { icon: <CheckCircle2 size={20} />, text: 'Verified Care Professionals' },
                { icon: <ShieldCheck size={20} />, text: 'Secure Payment Processing' },
                { icon: <Heart size={20} />, text: 'Dedicated 24/7 Support' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#374151', fontWeight: 600 }}
                >
                  <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
                  <span style={{ fontSize: 'clamp(0.85rem, 1vw, 1rem)' }}>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div className="login-form-side">
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Sign In</h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem' }}>Please enter your account details below.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, mb: 0 }}
                animate={{ opacity: 1, height: 'auto', mb: '2rem' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ 
                  background: '#fef2f2', 
                  color: '#991b1b', 
                  padding: '1rem', 
                  borderRadius: '1rem', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  border: '1px solid #fecaca',
                  marginBottom: '1.5rem'
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '1rem 1.25rem 1rem 3.25rem', 
                    borderRadius: '1rem', 
                    border: '1.5px solid #e5e7eb',
                    background: 'white',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }} 
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '1rem 3.25rem 1rem 3.25rem', 
                    borderRadius: '1rem', 
                    border: '1.5px solid #e5e7eb',
                    background: 'white',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }} 
                  className="login-input"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '1.25rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'none', 
                    color: '#9ca3af' 
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <input type="checkbox" id="remember" style={{ 
                width: '1.1rem', 
                height: '1.1rem', 
                borderRadius: '0.4rem', 
                cursor: 'pointer',
                accentColor: 'var(--primary)'
              }} />
              <label htmlFor="remember" style={{ fontSize: '0.9rem', color: '#4b5563', cursor: 'pointer', fontWeight: 500 }}>Remember me for 30 days</label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '1.25rem', 
                borderRadius: '1.25rem', 
                marginTop: '1rem',
                fontSize: '1.05rem'
              }}
            >
              {loading ? (
                <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }} />
              ) : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: '#6b7280', fontSize: '1.05rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 800 }}>Create Account</Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        .login-container {
          width: 100%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-radius: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          z-index: 10;
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin: 1rem;
        }
        .login-branding-side {
          padding: 4rem;
          background: rgba(124, 58, 237, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-right: 1px solid rgba(124, 58, 237, 0.1);
        }
        .login-form-side {
          padding: 4rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        @media (max-width: 1100px) {
          .login-container { max-width: 900px; }
          .login-branding-side, .login-form-side { padding: 3rem; }
        }
        @media (max-width: 950px) {
          .login-container { 
            grid-template-columns: 1fr; 
            max-width: 480px; 
            border-radius: 2rem;
          }
          .hide-mobile { display: none !important; }
          .login-form-side { padding: 3.5rem 2rem; }
          h2 { text-align: center; font-size: 2rem !important; }
          p { text-align: center; }
        }
        @media (max-width: 480px) {
          .auth-shell { padding: 0.75rem !important; }
          .login-container { margin: 0; border-radius: 1.5rem; width: 100%; }
          .login-form-side { padding: 2.5rem 1.25rem; }
          .login-input { padding: 1.15rem 1.25rem 1.15rem 3.25rem !important; }
          .form-group label { font-size: 0.85rem !important; }
        }
        .login-input {
          box-sizing: border-box;
          min-width: 0;
        }
        .login-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1) !important;
          background: white !important;
        }
        .text-gradient {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @media (max-width: 600px) {
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

export default Login;
