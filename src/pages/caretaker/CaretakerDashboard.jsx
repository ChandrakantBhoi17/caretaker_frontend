import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Clock, CheckCircle, Settings, TrendingUp, Save, User } from 'lucide-react';
import { bookingService, caretakerService, reviewService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/currency';
import { authService } from '../../services/api';

const getStatusBadge = (status) => {
  const map = {
    pending_caretaker: { label: 'Needs Confirmation', cls: 'badge-yellow' },
    confirmed:         { label: 'Confirmed', cls: 'badge-green' },
    admin_review:      { label: 'Under Review', cls: 'badge-purple' },
    rejected_by_admin: { label: 'Rejected', cls: 'badge-red' },
  };
  return map[status] || { label: status, cls: '' };
};

const CaretakerDashboard = () => {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('jobs');
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [wagesSaving, setWagesSaving] = useState(false);
  const [wagesInput, setWagesInput] = useState('');
  const [editName, setEditName] = useState('');
  const [editProfile, setEditProfile] = useState({
    bio: '',
    location: '',
    experience_years: 0,
    wages_price: 0,
    specialties: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        let userId = user?.id;
        if (!userId) {
          const me = await authService.getMe();
          userId = me?.id;
          if (me) setUser(me);
        }

        const b = await bookingService.getUserBookings();
        let mine = null;
        try {
          mine = await caretakerService.getMe();
        } catch (err) {
          // Fallback for older DB states or API errors: try finding profile in list.
          const all = await caretakerService.getAll();
          mine = all.find(c => c.user_id === userId) || null;
        }
        setBookings(b);
        setProfile(mine);
        setEditName(user?.full_name || '');
        if (mine) {
          setWagesInput(String(mine.wages_price ?? mine.daily_price ?? ''));
          setEditProfile({
            bio: mine.bio || '',
            location: mine.location || '',
            experience_years: mine.experience_years || 0,
            wages_price: mine.wages_price ?? mine.daily_price ?? '',
            specialties: mine.specialties || '',
          });
        }
        if (mine) {
          const rv = await reviewService.getReviewsForCaretaker(mine.id);
          setReviews(rv);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    setWagesInput(String(profile.wages_price ?? profile.daily_price ?? ''));
    setEditProfile({
      bio: profile.bio || '',
      location: profile.location || '',
      experience_years: profile.experience_years || 0,
      wages_price: profile.wages_price ?? profile.daily_price ?? '',
      specialties: profile.specialties || '',
    });
  }, [profile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMsg('');
    try {
      const parsedWages = parseFloat(editProfile.wages_price);
      const wagesPayload = Number.isFinite(parsedWages) && parsedWages > 0 ? parsedWages : null;
      const updatedProfile = await caretakerService.updateMe({
        full_name: editName,
        ...(wagesPayload != null ? { wages_price: wagesPayload } : {}),
        bio: editProfile.bio,
        location: editProfile.location,
        specialties: editProfile.specialties,
        experience_years: parseInt(editProfile.experience_years, 10) || 0,
      });
      setProfile(updatedProfile);
      if (updatedProfile?.wages_price != null) setWagesInput(String(updatedProfile.wages_price));
      if (updatedProfile?.full_name) setUser(prev => ({ ...prev, full_name: updatedProfile.full_name }));
      setMsg('✅ Profile updated successfully!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setMsg('❌ ' + (err.response?.data?.detail || 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setMsg('');
    try {
      const parsedWages = parseFloat(editProfile.wages_price);
      const wagesPayload = Number.isFinite(parsedWages) && parsedWages > 0 ? parsedWages : null;
      const created = await caretakerService.create({
        user_id: user.id,
        bio: editProfile.bio,
        location: editProfile.location,
        specialties: editProfile.specialties,
        experience_years: parseInt(editProfile.experience_years, 10) || 0,
        ...(wagesPayload != null ? { wages_price: wagesPayload } : {}),
      });
      setProfile(created);
      setWagesInput(String(created.wages_price ?? created.daily_price ?? ''));
      setMsg('✅ Caretaker profile created!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setMsg('❌ ' + (err.response?.data?.detail || 'Failed to create caretaker profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWages = async () => {
    if (!profile) return;
    setWagesSaving(true);
    setMsg('');
    try {
      const wagesPrice = parseFloat(wagesInput);
      if (!Number.isFinite(wagesPrice) || wagesPrice <= 0) {
        setMsg('❌ Please enter a valid daily wages amount (> 0).');
        return;
      }
      const updated = await caretakerService.updateMyWages(wagesPrice);
      setProfile(updated);
      setEditProfile(p => ({ ...p, wages_price: updated.wages_price ?? p.wages_price }));
      setMsg('✅ Daily wages updated!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setMsg('❌ ' + (err.response?.data?.detail || 'Failed to update daily wages'));
    } finally {
      setWagesSaving(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    setConfirming(bookingId);
    try {
      await bookingService.confirm(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
      setMsg('✅ Job confirmed successfully!');
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.detail || 'Failed to confirm'));
    } finally { setConfirming(null); }
  };

  const totalEarnings = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.total_price || 0), 0);
  const activeJobs = bookings.filter(b => b.status === 'confirmed').length;
  const pendingJobs = bookings.filter(b => b.status === 'pending_caretaker').length;

  const TABS = [
    { id: 'jobs', label: 'My Jobs' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'profile', label: 'My Profile' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7FF' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)', padding: '2rem 0 4rem' }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800 }}>Caretaker Dashboard 👩‍⚕️</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>Welcome back, {user?.full_name}. Here's your activity.</p>
          {profile && (
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>Set your daily wages:</div>
              <input
                type="number"
                step="0.1"
                min="0"
                value={wagesInput}
                onChange={(e) => setWagesInput(e.target.value)}
                className="form-input"
                style={{ width: '180px', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: 'white' }}
              />
              <button
                type="button"
                onClick={handleSaveWages}
                disabled={wagesSaving}
                className="btn btn-secondary btn-sm"
                style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}
              >
                {wagesSaving ? 'Saving…' : 'Save Wages'}
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Earnings', value: formatINR(totalEarnings), icon: <span style={{ fontWeight: 900 }}></span> },
              { label: 'Active Jobs', value: activeJobs, icon: <CheckCircle size={18} /> },
              { label: 'Awaiting Confirm', value: pendingJobs, icon: <Clock size={18} /> },
              { label: 'Your Rating', value: profile ? `${profile.rating.toFixed(1)} ⭐` : '—', icon: <Star size={18} /> },
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

      <div className="container" style={{ padding: '0 2rem', marginTop: '-2rem', paddingBottom: '3rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'white', padding: '0.35rem', borderRadius: '0.85rem', marginBottom: '1.75rem', boxShadow: '0 4px 16px rgba(124,58,237,0.08)', width: 'fit-content', border: '1px solid #EDE9FE' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '0.6rem 1.5rem', borderRadius: '0.6rem', fontWeight: 600, fontSize: '0.9rem', background: tab === t.id ? '#1D4ED8' : 'transparent', color: tab === t.id ? 'white' : '#6B7280', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>{msg}</div>}

        {/* ─── JOBS ─── */}
        {tab === 'jobs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading jobs…</div>}
            {!loading && bookings.length === 0 && (
              <div className="card" style={{ padding: '4rem', textAlign: 'center', color: '#9CA3AF' }}>
                <Calendar size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>No jobs yet</h3>
                <p>Keep your profile updated to attract more clients.</p>
              </div>
            )}
            {bookings.map(b => {
              const { label, cls } = getStatusBadge(b.status);
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                        <User size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>Client #{b.client_id} · Booking #{b.id}</div>
                        <div style={{ fontSize: '0.83rem', color: '#6B7280' }}>
                          {new Date(b.start_time).toLocaleDateString()} {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1D4ED8' }}>{formatINR(b.total_price || 0)}</span>
                      <span className={`badge ${cls}`}>{label}</span>
                      {b.status === 'pending_caretaker' && (
                        <button onClick={() => handleConfirm(b.id)} disabled={confirming === b.id} className="btn btn-success btn-sm">
                          <CheckCircle size={14} /> {confirming === b.id ? 'Confirming…' : 'Confirm Job'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ─── REVIEWS ─── */}
        {tab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <div className="card" style={{ padding: '4rem', textAlign: 'center', color: '#9CA3AF' }}>
                <Star size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                <h3>No reviews yet</h3>
                <p>Complete bookings to start receiving reviews from clients.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <div className="card" style={{ padding: '1.25rem 2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Star size={24} fill="#F59E0B" color="#F59E0B" />
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{profile?.rating.toFixed(1) || '—'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Average Rating</div>
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1.25rem 2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <TrendingUp size={24} color="#10B981" />
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{reviews.length}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Total Reviews</div>
                    </div>
                  </div>
                </div>
                {reviews.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                      {Array(5).fill(0).map((_, j) => <Star key={j} size={16} fill={j < r.rating ? '#F59E0B' : 'transparent'} color={j < r.rating ? '#F59E0B' : '#D1D5DB'} />)}
                    </div>
                    <p style={{ color: '#374151', fontSize: '0.93rem', lineHeight: 1.6 }}>{r.comment}</p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#9CA3AF' }}>Booking #{r.booking_id}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── PROFILE ─── */}
        {tab === 'profile' && (
          <div className="card" style={{ padding: '2rem', maxWidth: '560px' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                {user?.full_name?.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>{user?.full_name}</h2>
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>{user?.email}</p>
              </div>
            </div>

            {profile && (
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '0.9rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 800, marginBottom: '0.75rem', color: '#111827' }}>Current Profile</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem', fontSize: '0.9rem' }}>
                  <div><span style={{ color: '#6B7280' }}>Wages:</span> <strong>{formatINR(profile.wages_price ?? profile.daily_price ?? 0)}/day</strong></div>
                  <div><span style={{ color: '#6B7280' }}>Experience:</span> <strong>{profile.experience_years ?? 0} yrs</strong></div>
                  <div><span style={{ color: '#6B7280' }}>Location:</span> <strong>{profile.location || '—'}</strong></div>
                  <div><span style={{ color: '#6B7280' }}>Specialties:</span> <strong>{profile.specialties || '—'}</strong></div>
                </div>
                {profile.bio && (
                  <div style={{ marginTop: '0.9rem', color: '#374151', lineHeight: 1.6 }}>
                    <span style={{ color: '#6B7280' }}>Bio:</span> {profile.bio}
                  </div>
                )}
              </div>
            )}
            <form onSubmit={profile ? handleSaveProfile : handleCreateProfile} style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" rows={4} value={editProfile.bio} onChange={(e) => setEditProfile(p => ({ ...p, bio: e.target.value }))} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" value={editProfile.location} onChange={(e) => setEditProfile(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience (years)</label>
                    <input type="number" className="form-input" value={editProfile.experience_years} onChange={(e) => setEditProfile(p => ({ ...p, experience_years: e.target.value }))} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Wages Price (₹/day)</label>
                    <input type="number" step="0.1" className="form-input" value={editProfile.wages_price} onChange={(e) => setEditProfile(p => ({ ...p, wages_price: e.target.value }))} />
                    <div style={{ marginTop: '0.35rem', color: '#9CA3AF', fontSize: '0.8rem' }}>
                      Preview: <strong>{formatINR(editProfile.wages_price || 0)}</strong>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialties (comma separated)</label>
                    <input className="form-input" value={editProfile.specialties} onChange={(e) => setEditProfile(p => ({ ...p, specialties: e.target.value }))} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                  <Save size={18} /> {saving ? 'Saving…' : (profile ? 'Save Changes' : 'Create Profile')}
                </button>
              {!profile && (
                <div style={{ marginTop: '0.5rem', color: '#9CA3AF', fontSize: '0.85rem' }}>
                  <Settings size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle', opacity: 0.7 }} />
                  No caretaker profile found yet — create it here.
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaretakerDashboard;
