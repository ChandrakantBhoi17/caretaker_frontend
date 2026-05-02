import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Briefcase, Calendar, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { caretakerService, bookingService } from '../../services/api';
import { reviewService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/currency';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caretaker, setCaretaker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ start_time: '', end_time: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const c = await caretakerService.getById(id);
        setCaretaker(c);
        const rv = await reviewService.getReviewsForCaretaker(id);
        setReviews(rv);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const calcPrice = () => {
    if (!form.start_time || !form.end_time || !caretaker) return 0;
    const days = (new Date(form.end_time) - new Date(form.start_time)) / (1000 * 60 * 60 * 24);
    const rate = caretaker.wages_price ?? caretaker.daily_price ?? 0;
    return days > 0 ? (Math.ceil(days) * rate).toFixed(2) : 0;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setError(''); setSubmitting(true);
    try {
      await bookingService.create({
        caretaker_id: parseInt(id),
        start_time: form.start_time,
        end_time: form.end_time,
        total_price: parseFloat(calcPrice()),
      });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.detail || 'Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '6rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  if (!caretaker) return <div style={{ textAlign: 'center', padding: '6rem', color: '#9CA3AF' }}>Caretaker not found.</div>;

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={40} color="#16A34A" />
        </div>
      </motion.div>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Booking Submitted!</h2>
      <p style={{ color: '#6B7280', maxWidth: '420px', lineHeight: 1.7, marginBottom: '2rem' }}>
        Your request is now under admin review. You'll receive confirmation once approved and the caretaker confirms.
      </p>
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Go to My Dashboard <ArrowLeft size={16} /></button>
    </div>
  );

  return (
    <div style={{ background: '#F9F7FF', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ padding: '2rem 2rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '2rem' }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Caretaker Info */}
          <div>
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '1.25rem', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: 800 }}>
                  {String.fromCharCode(65 + (caretaker.id % 26))}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                    {caretaker.full_name ? caretaker.full_name : `Caretaker #${caretaker.id}`}
                  </h2>
                  <div style={{ display: 'flex', gap: '1rem', color: '#6B7280', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                    {caretaker.location && <span style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}><MapPin size={14} />{caretaker.location}</span>}
                    <span style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}><Briefcase size={14} />{caretaker.experience_years} yrs</span>
                    <span style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}><Star size={14} fill="#F59E0B" color="#F59E0B" />{caretaker.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: '1.25rem' }}>{caretaker.bio}</p>
              {caretaker.specialties && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {caretaker.specialties.split(',').map(s => <span key={s} className="badge badge-purple">{s.trim()}</span>)}
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Client Reviews ({reviews.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.4rem' }}>
                        {Array(5).fill(0).map((_, j) => <Star key={j} size={14} fill={j < r.rating ? '#F59E0B' : 'transparent'} color={j < r.rating ? '#F59E0B' : '#D1D5DB'} />)}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#374151' }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div>
            <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Book This Caretaker</h3>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7C3AED' }}>
                  {formatINR(caretaker.wages_price ?? caretaker.daily_price ?? 0)}
                  <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500 }}>/day</span>
                </span>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date & Time</label>
                  <div className="input-wrapper">
                    <Calendar size={17} className="input-icon" />
                    <input type="datetime-local" className="form-input form-input-icon"
                      value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">End Date & Time</label>
                  <div className="input-wrapper">
                    <Clock size={17} className="input-icon" />
                    <input type="datetime-local" className="form-input form-input-icon"
                      value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
                  </div>
                </div>

                {calcPrice() > 0 && (
                  <div style={{ background: '#F9F7FF', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #EDE9FE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#6B7280' }}>Rate</span>
                      <span>{formatINR(caretaker.wages_price ?? caretaker.daily_price ?? 0)}/day</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#7C3AED' }}>
                      <span>Total</span>
                      <span>{formatINR(calcPrice())}</span>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                  {submitting ? 'Submitting…' : 'Request Booking'}
                </button>
                <p style={{ fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center' }}>
                  Bookings go through admin review before confirmation.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
