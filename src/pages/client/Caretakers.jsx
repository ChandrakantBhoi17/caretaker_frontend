import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, ArrowRight, Search, Filter, Briefcase, Flag, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { caretakerService, reportService } from '../../services/api';
import { formatINR } from '../../utils/currency';

const ReportModal = ({ caretaker, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const REASONS = [
    'Inappropriate Behavior',
    'Misleading Information',
    'Unprofessionalism',
    'Late / No Show',
    'Safety Concern',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) { setError('Please select a reason.'); return; }
    setLoading(true);
    setError('');
    try {
      await reportService.create({
        caretaker_id: caretaker.id,
        reason,
        description
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{ background: 'white', borderRadius: '1.5rem', width: '100%', maxWidth: '450px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Report Caretaker</h3>
          <button onClick={onClose} style={{ background: 'none', color: '#9CA3AF' }}><X size={24} /></button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}><AlertCircle size={18} /> {error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Reason for Reporting</label>
            <select className="form-input" value={reason} onChange={e => setReason(e.target.value)} required>
              <option value="">Select a reason…</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description (Optional)</label>
            <textarea className="form-input" rows={4} placeholder="Provide more context about the issue…" value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-danger" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Caretakers = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCaretaker, setSelectedCaretaker] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    caretakerService.getAll().then(setCaretakers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = caretakers.filter(c =>
    !search ||
    c.location?.toLowerCase().includes(search.toLowerCase()) ||
    c.specialties?.toLowerCase().includes(search.toLowerCase()) ||
    c.bio?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#F9F7FF', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', padding: '4rem 0 6rem', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '2.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Find Your Perfect <span style={{ opacity: 0.85 }}>Caretaker</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Browse from 500+ verified professionals, read reviews, and book instantly.
        </p>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search by location, specialty (e.g. Elderly Care)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', borderRadius: '1rem', border: 'none', fontSize: '1rem', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-3rem', paddingBottom: '4rem', padding: '0 2rem 4rem' }}>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {successMsg}
          </motion.div>
        )}

        {/* Count */}
        <div style={{ margin: '2rem 0 1.5rem', color: '#6B7280', fontSize: '0.9rem' }}>
          Showing <strong style={{ color: '#1A1523' }}>{filtered.length}</strong> caretakers{search && ` for "${search}"`}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#9CA3AF' }}>
            <Search size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
            <h3>No caretakers found</h3>
            <p>Try different keywords or clear your search.</p>
            <button onClick={() => setSearch('')} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>Clear Search</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="card" style={{ overflow: 'hidden', position: 'relative' }}>
              
              {/* Report Button */}
              <button 
                onClick={() => setSelectedCaretaker(c)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 5, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Report this account"
              >
                <Flag size={16} />
              </button>

              <div style={{ height: '80px', background: `hsl(${(c.id * 47) % 360}, 60%, 55%)` }} />
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <div style={{ marginTop: '-28px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'white', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: '1.3rem', fontWeight: 800, color: '#7C3AED' }}>
                    {String.fromCharCode(65 + (c.id % 26))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#FEF9C3', padding: '0.3rem 0.6rem', borderRadius: '2rem' }}>
                    <Star size={13} fill="#F59E0B" color="#F59E0B" />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400E' }}>{c.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                  {c.full_name ? c.full_name : `Caretaker #${c.id}`}
                </h3>
                <p style={{ fontSize: '0.83rem', color: '#6B7280', marginBottom: '0.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {c.bio || 'Dedicated to delivering professional, compassionate home care.'}
                </p>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  {c.location && <span style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}><MapPin size={12} />{c.location}</span>}
                  <span style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}><Briefcase size={12} />{c.experience_years} yrs</span>
                </div>

                {c.specialties && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
                    {c.specialties.split(',').slice(0, 3).map(s => (
                      <span key={s} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{s.trim()}</span>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7C3AED' }}>
                      {formatINR(c.wages_price ?? c.daily_price ?? 0)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>/day</span>
                  </div>
                  <Link to={`/book/${c.id}`} className="btn btn-primary btn-sm">
                    Book Now <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCaretaker && (
          <ReportModal 
            caretaker={selectedCaretaker} 
            onClose={() => setSelectedCaretaker(null)} 
            onSuccess={() => {
              setSelectedCaretaker(null);
              setSuccessMsg('✅ Thank you. Your report has been submitted for review.');
              setTimeout(() => setSuccessMsg(''), 5000);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Caretakers;
