import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, CheckCircle,
  MapPin, Star, ArrowRight,
  CreditCard, Eye
} from 'lucide-react';
import { bookingService, caretakerService, paymentService, reviewService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/currency';
import { authService } from '../../services/api';

const getStatusBadge = (status) => {
  const map = {
    admin_review:     { label: 'Under Review', cls: 'badge-purple' },
    pending_caretaker:{ label: 'Pending Caretaker', cls: 'badge-yellow' },
    confirmed:        { label: 'Confirmed', cls: 'badge-green' },
    rejected_by_admin:{ label: 'Rejected', cls: 'badge-red' },
    cancelled:        { label: 'Cancelled', cls: '' },
  };
  return map[status] || { label: status, cls: '' };
};

const ClientDashboard = () => {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [reviewState, setReviewState] = useState({});
  const [reviewForm, setReviewForm] = useState({});
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(() => user?.full_name || '');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [bookingsError, setBookingsError] = useState('');
  const [caretakersError, setCaretakersError] = useState('');

  const caretakerById = React.useMemo(() => {
    const map = new Map();
    caretakers.forEach((c) => map.set(c.id, c));
    return map;
  }, [caretakers]);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingsResult, caretakersResult] = await Promise.allSettled([
          bookingService.getUserBookings(),
          caretakerService.getAll(),
        ]);
        setBookingsError('');
        setCaretakersError('');

        if (bookingsResult.status === 'fulfilled') {
          setBookings(bookingsResult.value || []);
        } else {
          console.error(bookingsResult.reason);
          setBookings([]);
          setBookingsError(bookingsResult.reason?.response?.data?.detail || 'Failed to load bookings.');
        }

        if (caretakersResult.status === 'fulfilled') {
          setCaretakers(caretakersResult.value || []);
        } else {
          console.error(caretakersResult.reason);
          setCaretakers([]);
          setCaretakersError(caretakersResult.reason?.response?.data?.detail || 'Failed to load caretakers.');
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const openBookingDetails = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setBookingDetail(null);
    try {
      const data = await bookingService.getById(id);
      setBookingDetail(data);
    } catch (e) {
      console.error(e);
      setMsg('❌ ' + (e.response?.data?.detail || `Failed to load booking #${id}`));
      setTimeout(() => setMsg(''), 4000);
    } finally {
      setDetailLoading(false);
    }
  };

  // Note: we sync `fullName` from `user` when opening the Account tab.

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const updated = await authService.updateMe({ full_name: fullName });
      setUser(updated);
      setMsg('✅ Account updated successfully!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setMsg('❌ ' + (err.response?.data?.detail || 'Failed to update account'));
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async (b) => {
    setPayingId(b.id);
    try {
      await paymentService.create({ booking_id: b.id, amount: b.total_price, currency: 'INR' });
      setMsg('✅ Payment processed successfully!');
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      setMsg('❌ Payment failed: ' + (e.response?.data?.detail || 'Unknown error'));
    } finally { setPayingId(null); }
  };

  const handleReview = async (b) => {
    const rf = reviewForm[b.id] || {};
    if (!rf.rating || !rf.comment?.trim()) { setMsg('❌ Rating and comment are required.'); return; }
    try {
      await reviewService.createReview({ booking_id: b.id, rating: parseFloat(rf.rating), comment: rf.comment });
      setMsg('✅ Review submitted!');
      setReviewState(prev => ({ ...prev, [b.id]: false }));
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.detail || 'Failed to submit review'));
    }
  };

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'admin_review').length;

  const TABS = [
    { id: 'bookings', label: 'My Bookings' },
    { id: 'browse', label: 'Browse Caretakers' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7FF' }}>
      {detailOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setDetailOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.55)',
            zIndex: 200,
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '860px', padding: '1.5rem', maxHeight: '85vh', overflow: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Booking Details
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>#{bookingDetail?.id || '—'}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setDetailOpen(false)}>Close</button>
            </div>

            {detailLoading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading…</div>
            )}

            {!detailLoading && bookingDetail && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card" style={{ padding: '1rem', background: '#F9F7FF' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Schedule</div>
                  <div style={{ color: '#374151' }}>
                    <div><b>Start:</b> {new Date(bookingDetail.start_time).toLocaleString()}</div>
                    <div><b>End:</b> {new Date(bookingDetail.end_time).toLocaleString()}</div>
                  </div>
                </div>
                <div className="card" style={{ padding: '1rem', background: '#F9F7FF' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Pricing</div>
                  <div style={{ color: '#374151' }}>
                    <div><b>Total:</b> {formatINR(bookingDetail.total_price || 0)}</div>
                    <div><b>Status:</b> {bookingDetail.status}</div>
                  </div>
                </div>
                <div className="card" style={{ padding: '1rem', background: '#F9F7FF' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Caretaker</div>
                  <div style={{ color: '#374151' }}>
                    <div><b>Name:</b> {bookingDetail.caretaker?.full_name || `Caretaker #${bookingDetail.caretaker_id}`}</div>
                    {bookingDetail.caretaker?.location && <div><b>Location:</b> {bookingDetail.caretaker.location}</div>}
                    {!!bookingDetail.caretaker_id && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <Link to={`/caretaker/${bookingDetail.caretaker_id}`} className="btn btn-secondary btn-sm">View Profile</Link>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card" style={{ padding: '1rem', background: '#F9F7FF' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Client</div>
                  <div style={{ color: '#374151' }}>
                    <div><b>Name:</b> {bookingDetail.client?.full_name || user?.full_name || `Client #${bookingDetail.client_id}`}</div>
                    {bookingDetail.client?.email && <div><b>Email:</b> {bookingDetail.client.email}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', padding: '2rem 0 4rem' }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800 }}>Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>Manage your care bookings and find new caretakers.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Bookings', value: bookings.length, icon: <Calendar size={18} /> },
              { label: 'Confirmed', value: confirmedBookings, icon: <CheckCircle size={18} /> },
              { label: 'Under Review', value: pendingBookings, icon: <Clock size={18} /> },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '0.75rem', padding: '1rem 1.5rem', color: 'white', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {s.icon}
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 2rem', marginTop: '-2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', background: 'white', padding: '0.35rem', borderRadius: '0.85rem', marginBottom: '1.75rem', boxShadow: '0 4px 16px rgba(124,58,237,0.08)', width: '100%', maxWidth: '100%', border: '1px solid #EDE9FE' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                if (t.id === 'account') setFullName(user?.full_name || '');
              }}
              style={{ padding: '0.6rem 1.5rem', borderRadius: '0.6rem', fontWeight: 600, fontSize: '0.9rem', background: tab === t.id ? '#7C3AED' : 'transparent', color: tab === t.id ? 'white' : '#6B7280', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>{msg}</div>}

        {/* ─── BOOKINGS TAB ─── */}
        {tab === 'bookings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '3rem' }}>
            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading bookings…</div>}
            {!loading && bookingsError && (
              <div className="alert alert-error">❌ {bookingsError}</div>
            )}
            {!loading && bookings.length === 0 && (
              <div className="card" style={{ padding: '4rem', textAlign: 'center', color: '#9CA3AF' }}>
                <Calendar size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>No bookings yet</h3>
                <p style={{ marginBottom: '1.5rem' }}>Browse verified caretakers to make your first booking.</p>
                <button onClick={() => setTab('browse')} className="btn btn-primary">Browse Caretakers <ArrowRight size={16} /></button>
              </div>
            )}
            {bookings.map(b => {
              const { label, cls } = getStatusBadge(b.status);
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                        <Calendar size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                          {caretakerById.get(b.caretaker_id)?.full_name || `Caretaker #${b.caretaker_id}`}
                        </div>
                        <div style={{ fontSize: '0.83rem', color: '#6B7280', marginTop: '0.2rem' }}>
                          {new Date(b.start_time).toLocaleDateString()} · {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#7C3AED' }}>
                        {formatINR(b.total_price || 0)}
                      </span>
                      <span className={`badge ${cls}`}>{label}</span>
                      <Link to={`/caretaker/${b.caretaker_id}`} className="btn btn-secondary btn-sm">
                        Profile
                      </Link>
                      <button onClick={() => openBookingDetails(b.id)} className="btn btn-secondary btn-sm">
                        <Eye size={14} /> View
                      </button>
                      {b.status === 'confirmed' && (
                        <button onClick={() => handlePay(b)} disabled={payingId === b.id} className="btn btn-primary btn-sm">
                          <CreditCard size={14} /> {payingId === b.id ? 'Processing…' : 'Pay Now'}
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => setReviewState(prev => ({ ...prev, [b.id]: !prev[b.id] }))} className="btn btn-secondary btn-sm">
                          <Star size={14} /> Review
                        </button>
                      )}
                    </div>
                  </div>
                  {reviewState[b.id] && (
                    <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: '#F9F7FF', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h4>Leave a Review</h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1,2,3,4,5].map(r => (
                          <button key={r} onClick={() => setReviewForm(prev => ({ ...prev, [b.id]: { ...prev[b.id], rating: r } }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <Star size={24} fill={reviewForm[b.id]?.rating >= r ? '#F59E0B' : 'transparent'} color={reviewForm[b.id]?.rating >= r ? '#F59E0B' : '#D1D5DB'} />
                          </button>
                        ))}
                      </div>
                      <textarea className="form-input" rows={3} placeholder="Share your experience…"
                        value={reviewForm[b.id]?.comment || ''}
                        onChange={e => setReviewForm(prev => ({ ...prev, [b.id]: { ...prev[b.id], comment: e.target.value } }))}
                      />
                      <button onClick={() => handleReview(b)} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Submit Review</button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ─── BROWSE TAB ─── */}
        {tab === 'browse' && (
          <div style={{ paddingBottom: '3rem' }}>
            {!loading && caretakersError && (
              <div className="alert alert-error">❌ {caretakersError}</div>
            )}
            {!loading && caretakers.length === 0 && (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
                No caretakers found.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {caretakers.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                  className="card card-hover" style={{ overflow: 'hidden' }}>
                  <div style={{ height: '80px', background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }} />
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <div style={{ marginTop: '-28px', marginBottom: '1rem' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'white', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '1.4rem', fontWeight: 800, color: '#7C3AED' }}>
                        {c.user_id}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem' }}>{c.full_name ? c.full_name : `Caretaker #${c.id}`}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={14} fill="#F59E0B" color="#F59E0B" />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{(c.rating ?? 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {c.bio || 'Professional caregiver dedicated to quality care.'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#6B7280', marginBottom: '1rem' }}>
                      {c.location && <span style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}><MapPin size={13} />{c.location}</span>}
                      <span>{c.experience_years ?? 0} yrs exp</span>
                    </div>
                    {c.specialties && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                        {c.specialties.split(',').map(s => <span key={s} className="badge badge-purple" style={{ fontSize: '0.72rem' }}>{s.trim()}</span>)}
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#7C3AED', fontSize: '1.1rem' }}>
                        {formatINR(c.wages_price ?? c.daily_price ?? 0)}
                        <span style={{ fontWeight: 500, color: '#9CA3AF', fontSize: '0.8rem' }}>/day</span>
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/caretaker/${c.id}`} className="btn btn-secondary btn-sm">View</Link>
                        <Link to={`/book/${c.id}`} className="btn btn-primary btn-sm">Book <ArrowRight size={14} /></Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ACCOUNT TAB ─── */}
        {tab === 'account' && (
          <div style={{ paddingBottom: '3rem' }}>
            <div className="card" style={{ padding: '2rem', maxWidth: '560px' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                  {user?.full_name?.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem' }}>{user?.full_name}</h2>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>{user?.email}</p>
                  <span className="badge badge-green" style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>{user?.role}</span>
                </div>
              </div>
              <form onSubmit={handleSaveAccount} style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
