import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart, Shield, Home, ArrowRight, Star,
  CheckCircle2, Users, Award, Phone, Globe,
  Baby, Brain, Zap, ChevronRight
} from 'lucide-react';
import ContactUs from './ContactUs';

const SERVICES = [
  { icon: <Users size={28} />, title: 'Elderly Care', desc: 'Compassionate support for seniors — from daily routines to companionship.', color: '#7C3AED' },
  { icon: <Baby size={28} />, title: 'Baby Care', desc: 'Gentle, attentive care for your little ones by certified professionals.', color: '#EC4899' },
  { icon: <Brain size={28} />, title: 'Dementia Care', desc: 'Specialized support focused on memory care and cognitive assistance.', color: '#1D4ED8' },
  { icon: <Home size={28} />, title: 'Post-Hospital Care', desc: 'Recovery assistance and daily living support after medical procedures.', color: '#10B981' },
  { icon: <Shield size={28} />, title: 'Disability Care', desc: 'Empowering independence with personalized, respectful assistance.', color: '#F59E0B' },
  { icon: <Zap size={28} />, title: 'General Care', desc: 'Flexible home care for hygiene, nutrition, safety, and well-being.', color: '#EF4444' },
];

const STEPS = [
  { step: '01', title: 'Create Your Profile', desc: 'Register as a client or caretaker. Clients describe their care needs; caretakers showcase their expertise.' },
  { step: '02', title: 'Browse & Book', desc: 'Clients search verified caretakers by specialty and location, then book with one click.' },
  { step: '03', title: 'Admin Reviews', desc: 'Our team reviews every booking to ensure safety and compatibility before confirming.' },
  { step: '04', title: 'Care Delivered', desc: 'Caretaker confirms and arrives. Track progress and leave a review after.' },
];

const STATS = [
  { value: '10K+', label: 'Families Served' },
  { value: '500+', label: 'Verified Caretakers' },
  { value: '99%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support Available' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Client — Elderly Care', text: 'buddyofcare.com matched us with an incredible caretaker for my mother. The booking process was seamless and we felt safe every step of the way.', rating: 5 },
  { name: 'David R.', role: 'Caretaker — 5 years exp.', text: 'As a caretaker, this platform changed my career. I get consistent bookings and the admin review process shows clients they can trust me.', rating: 5 },
  { name: 'Priya K.', role: 'Client — Baby Care', text: 'Found an amazing nanny within hours! The verification system gave us peace of mind. Highly recommend to every parent.', rating: 5 },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const LandingPage = () => {
  const [activeService, setActiveService] = useState(0);

      return (
    <div style={{ background: '#FDFCFF' }}>
      {/* ─── HERO ─── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(2.5rem, 5vw, 4rem)', position: 'relative', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="container">
          <div className="grid-2" style={{ gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'center' }}>
            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#EDE9FE', borderRadius: '2rem', color: '#6D28D9', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <Award size={16} /> India's Most Trusted Care Platform
                </div>
              </motion.div>

              <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.4rem, 5vw, 3.75rem)', lineHeight: 1.1, marginBottom: '1.25rem', fontWeight: 800 }}>
                Compassionate
                <span className="text-gradient"> Care at Your</span>
                Doorstep.
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 1.6vw, 1.1rem)', color: '#6B7280', lineHeight: 1.8, marginBottom: '2.25rem', maxWidth: '520px' }}>
                Connect with verified professionals who provide dignified, personalized care — right in the comfort of home. Because every life deserves tender care.
              </motion.p>

              <motion.div variants={fadeUp} className="hero-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                <Link to="/caretakers" className="btn btn-primary btn-xl">
                  Find a Caretaker <ArrowRight size={20} />
                </Link>
                <Link to="/register" className="btn btn-secondary btn-xl">
                  Join as Caretaker
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="landing-hero-stats" style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap', paddingTop: '1.25rem', borderTop: '1px solid #EDE9FE' }}>
                {STATS.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7C3AED' }}>{s.value}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Visual Card Stack */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="hero-visual" style={{ position: 'relative', height: 'min(520px, 70vh)', maxWidth: '560px', width: '100%', margin: '0 auto' }}>
              {/* Main Card */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', borderRadius: '2.5rem', overflow: 'hidden', boxShadow: '0 30px 60px rgba(124,58,237,0.3)' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                    <Heart size={100} fill="rgba(255,255,255,0.25)" color="white" strokeWidth={1} />
                  </motion.div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1.5rem', textAlign: 'center' }}>Professional Care Services</h3>
                  <p style={{ opacity: 0.8, marginTop: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>Trusted by 10,000+ families</p>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="glass hide-mobile" style={{ position: 'absolute', top: '10%', right: '-2rem', padding: '1rem 1.25rem', borderRadius: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', minWidth: '200px' }}>
                <div style={{ width: '40px', height: '40px', background: '#DCFCE7', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={22} color="#16A34A" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Verified Caretakers</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>500+ Active</div>
                </div>
              </motion.div>

              <motion.div animate={{ x: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="glass hide-mobile" style={{ position: 'absolute', bottom: '12%', left: '-2rem', padding: '1rem 1.25rem', borderRadius: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', minWidth: '200px' }}>
                <div style={{ width: '40px', height: '40px', background: '#FEF9C3', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={22} color="#F59E0B" fill="#F59E0B" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Average Rating</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>4.9 / 5.0 ⭐</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" style={{ padding: 'clamp(4rem, 8vw, 5rem) 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="badge badge-purple" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>Our Care Services</div>
            <h2 style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>Specialized Care for <span className="text-gradient">Every Need</span></h2>
            <p style={{ color: '#6B7280', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
              From elderly support to newborn care — our professionals bring dignity, skill, and heart to every home.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {SERVICES.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                onHoverStart={() => setActiveService(i)}
                className="card card-hover"
                style={{ 
                  padding: '1.5rem', 
                  cursor: 'pointer', 
                  borderColor: activeService === i ? s.color : 'transparent', 
                  borderWidth: '2px', 
                  borderStyle: 'solid',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: '1rem' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'auto', paddingTop: '1rem', color: s.color, fontWeight: 700, fontSize: '0.8rem' }}>
                  Learn more <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ padding: 'clamp(4rem, 8vw, 5rem) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="badge badge-purple" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>Simple Process</div>
            <h2 style={{ fontSize: 'clamp(1.85rem, 4.5vw, 2.75rem)' }}>Get Care in <span className="text-gradient">4 Easy Steps</span></h2>
          </div>
          <div className="grid-4">
            {STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#EDE9FE', marginBottom: '1rem' }}>{s.step}</div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{s.title}</h4>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 5rem) 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="badge badge-purple" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>Reviews</div>
            <h2 style={{ fontSize: 'clamp(1.85rem, 4.5vw, 2.75rem)' }}>What Our <span className="text-gradient">Community Says</span></h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={16} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: 'clamp(2rem, 5vw, 5rem) 0' }}>
        <div className="container">
          <div className="landing-cta" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', borderRadius: 'clamp(1.5rem, 4vw, 2.5rem)', padding: 'clamp(3rem, 8vw, 5rem) clamp(1.25rem, 5vw, 3rem)', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', marginBottom: '1.25rem', fontWeight: 800 }}>Ready to Experience the Best Care?</h2>
              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', opacity: 0.9, maxWidth: '600px', margin: '0 auto clamp(2rem, 5vw, 3rem)', lineHeight: 1.7 }}>
                Join thousands of families and caregivers on India's most trusted care platform.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary" style={{ background: 'white', color: '#7C3AED', fontWeight: 700, minWidth: '180px' }}>
                  Get Started Free <ArrowRight size={20} />
                </Link>
                <Link to="/caretakers" className="btn" style={{ border: '2px solid rgba(255,255,255,0.5)', color: 'white', background: 'transparent', minWidth: '180px' }}>
                  Browse Caretakers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT US ─── */}
      <section id="contact-us" style={{ padding: 'clamp(3rem, 6vw, 4.5rem) 0', background: 'white' }}>
        <ContactUs embedded />
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#1A1523', color: 'white', padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="grid-4" style={{ marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={18} color="white" fill="white" />
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>info@buddyofcare.com</span>
              </div>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: 1.6 }}>Because every life deserves tender care. Professional. Compassionate. Always by your side.</p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center' }}>
                <Phone size={16} color="#9CA3AF" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>+91 98613 54361</span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>+91 96920 76679</span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>+91 96920 87652</span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>+91 96920 72365</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                <Globe size={16} color="#9CA3AF" />
                <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>buddyofcare.com</span>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', color: '#E5E7EB' }}>Services</h4>
              {['Elderly Care', 'Baby Care', 'Dementia Care', 'Post-Hospital Care', 'Disability Care'].map(s => (
                <div key={s} style={{ color: '#9CA3AF', fontSize: '0.88rem', marginBottom: '0.6rem', cursor: 'pointer' }}>{s}</div>
              ))}
            </div>
            <div>
              <h4 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', color: '#E5E7EB' }}>For Caretakers</h4>
              {['Join as Caretaker', 'How It Works', 'Earnings Calculator', 'Training Resources', 'Support'].map(s => (
                <div key={s} style={{ color: '#9CA3AF', fontSize: '0.88rem', marginBottom: '0.6rem', cursor: 'pointer' }}>{s}</div>
              ))}
            </div>
            <div>
              <h4 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', color: '#E5E7EB' }}>Company</h4>
              {['About Us', 'Careers', 'Blog', 'Privacy Policy', 'Terms of Service'].map(s => (
                <div key={s} style={{ color: '#9CA3AF', fontSize: '0.88rem', marginBottom: '0.6rem', cursor: 'pointer' }}>{s}</div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #2D2540', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>© 2024 Buddy of Care. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge" style={{ background: '#2D2540', color: '#9CA3AF' }}>Trained Caregivers</span>
              <span className="badge" style={{ background: '#2D2540', color: '#9CA3AF' }}>24/7 Support</span>
              <span className="badge" style={{ background: '#2D2540', color: '#9CA3AF' }}>Verified & Trusted</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
