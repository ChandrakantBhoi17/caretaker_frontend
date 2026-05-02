import React from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { contactService } from '../services/api';

const ContactUs = () => {
  const [sending, setSending] = React.useState(false);
  const [status, setStatus] = React.useState({ type: '', msg: '' });
  const statusRef = React.useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus({ type: '', msg: '' });
    setSending(true);
    try {
      const data = new FormData(formEl);
      await contactService.send({
        name: String(data.get('name') || ''),
        email: String(data.get('email') || ''),
        subject: String(data.get('subject') || ''),
        message: String(data.get('message') || ''),
      });
      const msg = 'Submitted! Thanks — your message has been sent.';
      setStatus({ type: 'success', msg });
      formEl.reset();
      window.setTimeout(() => statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    } catch (err) {
      console.error('Contact submit failed:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to send. Please try again.';
      setStatus({ type: 'error', msg });
      window.setTimeout(() => statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>Support</div>
          <h1 style={{ fontSize: '2.75rem' }}>
            Contact <span className="text-gradient">Us</span>
          </h1>
          <p style={{ color: '#6B7280', maxWidth: '680px', margin: '0.75rem auto 0', lineHeight: 1.8 }}>
            Have a question about bookings, verification, or becoming a caretaker? Send us a message and we’ll get back quickly.
          </p>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Send a message</h3>
            {status.msg && (
              <div
                ref={statusRef}
                id="contact-status"
                role="status"
                aria-live="polite"
                className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`}
                style={{ marginBottom: '1rem' }}
              >
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <div>{status.msg}</div>
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" name="name" placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" name="email" placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input" name="subject" placeholder="How can we help?" required />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" name="message" rows={6} placeholder="Write your message..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={sending}>
                <Send size={18} /> {sending ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Contact details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', color: '#374151' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="badge badge-purple"><Phone size={14} /> Phone</div>
                  <span style={{ fontWeight: 600 }}>+91 00000 00000</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="badge badge-purple"><Mail size={14} /> Email</div>
                  <span style={{ fontWeight: 600 }}>support@buddyofcare.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="badge badge-purple"><MapPin size={14} /> Office</div>
                  <span style={{ fontWeight: 600 }}>India (Remote-first)</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Hours</h3>
              <p style={{ color: '#6B7280', lineHeight: 1.8 }}>
                Mon–Sat: 9:00 AM – 8:00 PM IST<br />
                Emergency support: 24/7 for active bookings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
