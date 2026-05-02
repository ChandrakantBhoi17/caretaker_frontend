import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Star } from 'lucide-react';
import { caretakerService, reviewService } from '../../services/api';
import { formatINR } from '../../utils/currency';

const CaretakerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caretaker, setCaretaker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let c = null;
        try {
          c = await caretakerService.getById(id);
        } catch (err) {
          // Backward/URL-compat: some links may pass user_id instead of caretaker.id
          c = await caretakerService.getByUserId(id);
        }
        setCaretaker(c);
        try {
          const rv = await reviewService.getReviewsForCaretaker(id);
          setReviews(rv || []);
        } catch (e) {
          console.error(e);
          setReviews([]);
        }
      } catch (e) {
        console.error(e);
        setCaretaker(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  }

  if (!caretaker) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem', color: '#9CA3AF' }}>
        Caretaker not found.
        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm"><ArrowLeft size={14} /> Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F9F7FF', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ padding: '2rem 2rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="responsive-profile-grid">
          <div>
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '1.25rem', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: 800 }}>
                  {String.fromCharCode(65 + (caretaker.id % 26))}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                    {caretaker.full_name ? caretaker.full_name : `Caretaker #${caretaker.id}`}
                  </h2>
                  <div style={{ display: 'flex', gap: '1rem', color: '#6B7280', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                    {caretaker.location && <span style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}><MapPin size={14} />{caretaker.location}</span>}
                    <span style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}><Briefcase size={14} />{caretaker.experience_years ?? 0} yrs</span>
                    <span style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}><Star size={14} fill="#F59E0B" color="#F59E0B" />{(caretaker.rating ?? 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: '1.25rem' }}>{caretaker.bio || 'Professional caregiver dedicated to quality care.'}</p>
              {caretaker.specialties && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {caretaker.specialties.split(',').map(s => <span key={s} className="badge badge-purple">{s.trim()}</span>)}
                </div>
              )}
            </div>

            {reviews.length > 0 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Client Reviews ({reviews.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.4rem' }}>
                        {Array(5).fill(0).map((_, j) => (
                          <Star key={j} size={14} fill={j < r.rating ? '#F59E0B' : 'transparent'} color={j < r.rating ? '#F59E0B' : '#D1D5DB'} />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#374151' }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 800 }}>Pricing</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#7C3AED' }}>
                  {formatINR(caretaker.wages_price ?? caretaker.daily_price ?? 0)}
                  <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500 }}>/day</span>
                </div>
              </div>

              <Link to={`/book/${caretaker.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Book This Caretaker
              </Link>

              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#9CA3AF', lineHeight: 1.5 }}>
                Bookings go through admin review before confirmation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaretakerProfile;
