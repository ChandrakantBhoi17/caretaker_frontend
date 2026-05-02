import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, Clock, CheckCircle, XCircle,
  TrendingUp, Search, Menu, X, Shield, Bell, Settings,
  RefreshCw, Eye, PieChart as PieIcon, BarChart3, LineChart as LineIcon,
  AlertTriangle, MessageSquare, Flag
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { adminService } from '../../services/api';
import { formatINR } from '../../utils/currency';

const SERVICES = [
  { id: 1, name: 'Elderly Care', active: true },
  { id: 2, name: 'Baby Care', active: true },
  { id: 3, name: 'Dementia Care', active: true },
  { id: 4, name: 'Post-Hospital Care', active: true },
  { id: 5, name: 'Disability Care', active: false },
  { id: 6, name: 'General Care', active: true },
];

const getStatusBadge = (status) => {
  const map = {
    admin_review: { label: 'Awaiting Review', cls: 'badge badge-purple' },
    pending_caretaker: { label: 'Pending Caretaker', cls: 'badge badge-yellow' },
    confirmed: { label: 'Confirmed', cls: 'badge badge-green' },
    rejected_by_admin: { label: 'Rejected', cls: 'badge badge-red' },
    cancelled: { label: 'Cancelled', cls: 'badge badge-gray' },
  };
  return map[status] || { label: status, cls: 'badge badge-gray' };
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [pendingBookings, setPendingBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [statsData, setStatsData] = useState({
    total_users: 0,
    active_users: 0,
    pending_users: 0,
    active_bookings: 0,
    pending_approvals: 0,
    total_revenue: 0
  });
  const [reportsData, setReportsData] = useState({
    bookings_trend: [],
    revenue_trend: [],
    top_caretakers: []
  });
  const [userReports, setUserReports] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [contactUnreadOnly, setContactUnreadOnly] = useState(false);
  const [contactLoading, setContactLoading] = useState(true);
  const [services, setServices] = useState(SERVICES);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState({});
  const [showRejectInput, setShowRejectInput] = useState({});
  const [newService, setNewService] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [reportNote, setReportNote] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { label: 'Total Users', value: statsData.total_users, icon: <Users size={22} />, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Active Users', value: statsData.active_users, icon: <CheckCircle size={22} />, color: '#10B981', bg: '#DCFCE7' },
    { label: 'Pending Users', value: statsData.pending_users, icon: <Clock size={22} />, color: '#F59E0B', bg: '#FEF9C3' },
    { label: 'Pending Approvals', value: statsData.pending_approvals, icon: <Shield size={22} />, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Active Bookings', value: statsData.active_bookings, icon: <Calendar size={22} />, color: '#1D4ED8', bg: '#DBEAFE' },
    { label: 'Total Revenue', value: formatINR(statsData.total_revenue), icon: <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>₹</div>, color: '#10B981', bg: '#DCFCE7' },
  ];

  useEffect(() => {
    fetchData();
    fetchContactMessages();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pending, active, stats, reports, uReports] = await Promise.all([
        adminService.getPendingBookings(),
        adminService.getActiveBookings(),
        adminService.getStats(),
        adminService.getReports(),
        adminService.getUserReports()
      ]);
      setPendingBookings(pending);
      setActiveBookings(active || []);
      setStatsData(stats);
      setReportsData(reports);
      setUserReports(uReports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactMessages = async () => {
    setContactLoading(true);
    try {
      const params = {
        search: contactSearch || undefined,
        unread_only: contactUnreadOnly || undefined,
      };
      const messages = await adminService.getContactMessages(params);
      setContactMessages(messages || []);
    } catch (e) {
      console.error('Failed to fetch contact messages', e);
    } finally {
      setContactLoading(false);
    }
  };

  const handleContactSearch = () => {
    fetchContactMessages();
  };

  const handleToggleContactFilter = async () => {
    const nextUnreadOnly = !contactUnreadOnly;
    setContactUnreadOnly(nextUnreadOnly);
    const params = {
      search: contactSearch || undefined,
      unread_only: nextUnreadOnly || undefined,
    };
    setContactLoading(true);
    try {
      const messages = await adminService.getContactMessages(params);
      setContactMessages(messages || []);
    } catch (e) {
      console.error('Failed to fetch contact messages', e);
    } finally {
      setContactLoading(false);
    }
  };

  const handleMarkMessageRead = async (message) => {
    try {
      const updated = await adminService.updateContactMessage(message.id, { is_read: !message.is_read });
      setContactMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      setActionMsg(`✅ Message #${message.id} marked ${updated.is_read ? 'read' : 'unread'}.`);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setActionMsg(`❌ Failed to update message: ${e.response?.data?.detail || 'Unknown error'}`);
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this contact message? This cannot be undone.')) return;
    try {
      await adminService.deleteContactMessage(messageId);
      setContactMessages(prev => prev.filter(m => m.id !== messageId));
      setActionMsg(`✅ Message #${messageId} deleted.`);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setActionMsg(`❌ Failed to delete message: ${e.response?.data?.detail || 'Unknown error'}`);
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const fetchPending = fetchData;

  const handleApprove = async (id) => {
    try {
      await adminService.approveBooking(id);
      setPendingBookings(prev => prev.filter(b => b.id !== id));
      setActionMsg(`✅ Booking #${id} approved successfully.`);
      fetchData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setActionMsg(`❌ Failed: ${e.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const handleReject = async (id) => {
    const reason = rejectReason[id];
    if (!reason?.trim()) { alert('Please enter a rejection reason.'); return; }
    try {
      await adminService.rejectBooking(id, reason);
      setPendingBookings(prev => prev.filter(b => b.id !== id));
      setShowRejectInput(prev => ({ ...prev, [id]: false }));
      setActionMsg(`✅ Booking #${id} rejected.`);
      fetchData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setActionMsg(`❌ Failed: ${e.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const openBookingDetails = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setBookingDetail(null);
    try {
      const data = await adminService.getBookingDetails(id);
      setBookingDetail(data);
    } catch (e) {
      console.error(e);
      setActionMsg(`❌ Failed to load booking #${id}: ${e.response?.data?.detail || 'Unknown error'}`);
      setTimeout(() => setActionMsg(''), 3000);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateReport = async (id, status) => {
    const notes = reportNote[id];
    try {
      await adminService.updateUserReport(id, { status, admin_notes: notes });
      setActionMsg(`✅ Report #${id} marked as ${status}.`);
      fetchData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setActionMsg(`❌ Failed: ${e.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const handleAddService = () => {
    if (!newService.trim()) return;
    setServices(prev => [...prev, { id: Date.now(), name: newService.trim(), active: true }]);
    setNewService('');
    setActionMsg('✅ Service added successfully.');
    setTimeout(() => setActionMsg(''), 3000);
  };

  const toggleService = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'active_bookings', label: `Active Bookings ${activeBookings.length > 0 ? `(${activeBookings.length})` : ''}` },
    { id: 'approvals', label: `Approvals ${pendingBookings.length > 0 ? `(${pendingBookings.length})` : ''}` },
    { id: 'contact_messages', label: `Contact Messages ${contactMessages.length > 0 ? `(${contactMessages.length})` : ''}` },
    { id: 'user_reports', label: `User Reports ${userReports.filter(r => r.status === 'pending').length > 0 ? `(${userReports.filter(r => r.status === 'pending').length})` : ''}` },
    { id: 'reports', label: 'Reporting' },
    { id: 'services', label: 'Services' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7FF' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #EDE9FE', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge badge-purple" style={{ marginBottom: '0.4rem' }}>Admin Console</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>System Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button type="button" className="btn btn-icon btn-secondary show-mobile-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu size={18} />
            </button>
            <button onClick={fetchData} className="btn btn-secondary btn-sm"><RefreshCw size={15} /> Refresh</button>
            <button className="btn btn-primary btn-sm"><Settings size={15} /> Settings</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 2rem' }}>
        <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
              <div>
                <div className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>Admin Menu</div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Dashboard Sections</h2>
              </div>
              <button type="button" className="btn btn-icon btn-secondary show-mobile-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <X size={18} />
              </button>
            </div>
            <nav className="sidebar-nav">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-link ${tab === item.id ? 'active' : ''}`}
                  onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="sidebar-summary">
              <div className="sidebar-summary-title">Quick overview</div>
              <div className="sidebar-summary-grid">
                {stats.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="sidebar-summary-card">
                    <div className="sidebar-summary-icon">{item.icon}</div>
                    <div>
                      <div className="sidebar-summary-value">{item.value}</div>
                      <div className="sidebar-summary-label">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="admin-main" onClick={() => sidebarOpen && setSidebarOpen(false)}>
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
              style={{ width: '100%', maxWidth: '920px', padding: '1.5rem', maxHeight: '85vh', overflow: 'auto' }}
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
                <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              )}

              {!detailLoading && bookingDetail && (
                <div className="grid-2" style={{ alignItems: 'start' }}>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ fontWeight: 800 }}>Summary</div>
                      <span className={getStatusBadge(bookingDetail.status).cls}>{getStatusBadge(bookingDetail.status).label}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.92rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                        <span style={{ color: '#6B7280' }}>Start</span>
                        <span style={{ fontWeight: 700 }}>{new Date(bookingDetail.start_time).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                        <span style={{ color: '#6B7280' }}>End</span>
                        <span style={{ fontWeight: 700 }}>{new Date(bookingDetail.end_time).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                        <span style={{ color: '#6B7280' }}>Total</span>
                        <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{formatINR(bookingDetail.total_price || 0)}</span>
                      </div>
                      {bookingDetail.admin_rejection_reason && (
                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.75rem', color: '#991B1B' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>Rejection Reason</div>
                          <div style={{ marginTop: '0.25rem' }}>{bookingDetail.admin_rejection_reason}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Client</div>
                      <div style={{ fontSize: '0.92rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div><span style={{ color: '#6B7280' }}>ID:</span> <strong>{bookingDetail.client?.id ?? bookingDetail.client_id}</strong></div>
                        <div><span style={{ color: '#6B7280' }}>Name:</span> <strong>{bookingDetail.client?.full_name || '—'}</strong></div>
                        <div><span style={{ color: '#6B7280' }}>Email:</span> <strong>{bookingDetail.client?.email || '—'}</strong></div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Caretaker</div>
                      <div style={{ fontSize: '0.92rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div><span style={{ color: '#6B7280' }}>ID:</span> <strong>{bookingDetail.caretaker?.id ?? bookingDetail.caretaker_id}</strong></div>
                        <div><span style={{ color: '#6B7280' }}>Location:</span> <strong>{bookingDetail.caretaker?.location || '—'}</strong></div>
                        <div><span style={{ color: '#6B7280' }}>Wages price:</span> <strong>{formatINR(bookingDetail.caretaker?.wages_price ?? bookingDetail.caretaker?.daily_price ?? 0)}</strong></div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Payment / Review</div>
                      <div style={{ fontSize: '0.92rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div><span style={{ color: '#6B7280' }}>Payment:</span> <strong>{bookingDetail.payment?.status || '—'}</strong></div>
                        <div><span style={{ color: '#6B7280' }}>Txn:</span> <strong>{bookingDetail.payment?.transaction_id || '—'}</strong></div>
                        <div><span style={{ color: '#6B7280' }}>Review:</span> <strong>{bookingDetail.review ? `${bookingDetail.review.rating}/5` : '—'}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Action Message */}
        {actionMsg && (
          <div className={`alert ${actionMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
            {actionMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: 'white', border: '1px solid #EDE9FE', borderRadius: '1rem', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A1523' }}>{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{TABS.find(t => t.id === tab)?.label}</h2>
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="grid-2">
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #EDE9FE', fontWeight: 700, fontSize: '1.1rem' }}>
                Recent Pending Bookings
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr>
                    <th>ID</th><th>Client</th><th>Status</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Loading…</td></tr>
                    ) : pendingBookings.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No pending bookings</td></tr>
	                    ) : pendingBookings.slice(0, 5).map(b => (
	                      <tr key={b.id}>
	                        <td>#{b.id}</td>
	                        <td>{b.client?.full_name || `User ${b.client_id}`}</td>
	                        <td><span className={getStatusBadge(b.status).cls}>{getStatusBadge(b.status).label}</span></td>
	                        <td><button onClick={() => openBookingDetails(b.id)} className="btn btn-secondary btn-icon btn-sm"><Eye size={14} /></button></td>
	                      </tr>
	                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #EDE9FE', fontWeight: 700, fontSize: '1.1rem' }}>
                Recent User Reports
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr>
                    <th>Reporter</th><th>Target</th><th>Reason</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Loading…</td></tr>
                    ) : userReports.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No reports</td></tr>
                    ) : userReports.slice(0, 5).map(r => (
                      <tr key={r.id}>
                        <td>{r.reporter_name}</td>
                        <td>{r.caretaker_name}</td>
                        <td style={{ fontSize: '0.85rem' }}>{r.reason}</td>
                        <td><span className={`badge ${r.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: ACTIVE BOOKINGS ── */}
        {tab === 'active_bookings' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #EDE9FE', fontWeight: 700, fontSize: '1.1rem' }}>
              Active Bookings
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Caretaker</th>
                    <th>Start</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading…</td></tr>
                  ) : activeBookings.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No active bookings</td></tr>
                  ) : activeBookings.map((b) => (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td>{b.client?.full_name || `User ${b.client_id}`}</td>
                      <td>{b.caretaker?.full_name || `Caretaker ${b.caretaker_id}`}</td>
                      <td style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                        {b.start_time ? new Date(b.start_time).toLocaleString() : '—'}
                      </td>
                      <td><span className={getStatusBadge(b.status).cls}>{getStatusBadge(b.status).label}</span></td>
                      <td>
                        <button onClick={() => openBookingDetails(b.id)} className="btn btn-secondary btn-icon btn-sm">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: APPROVALS ── */}
        {tab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading…</div>}
            {!loading && pendingBookings.length === 0 && <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No pending bookings</div>}
	            {pendingBookings.map(b => (
	              <motion.div key={b.id} className="card" style={{ padding: '1.5rem' }}>
	                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
	                  <div>
	                    <h4 style={{ marginBottom: '0.25rem' }}>Booking #{b.id}</h4>
	                    <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>
	                      Client {b.client?.full_name ? <strong>{b.client.full_name}</strong> : `#${b.client_id}`} → Caretaker #{b.caretaker_id}
	                    </p>
	                  </div>
	                  <div style={{ display: 'flex', gap: '0.5rem' }}>
	                    <button onClick={() => openBookingDetails(b.id)} className="btn btn-secondary btn-sm"><Eye size={14} /> View</button>
	                    <button onClick={() => handleApprove(b.id)} className="btn btn-success btn-sm">Approve</button>
	                    <button onClick={() => setShowRejectInput(prev => ({ ...prev, [b.id]: !prev[b.id] }))} className="btn btn-danger btn-sm">Reject</button>
	                  </div>
	                </div>
                {showRejectInput[b.id] && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="form-input" placeholder="Reason…" value={rejectReason[b.id] || ''} onChange={e => setRejectReason(prev => ({ ...prev, [b.id]: e.target.value }))} style={{ flex: 1 }} />
                    <button onClick={() => handleReject(b.id)} className="btn btn-danger btn-sm">Confirm</button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* ── TAB: USER REPORTS ── */}
        {tab === 'contact_messages' && (
          <div>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: '1 1 280px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#6B7280' }}>Search messages</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="search"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      placeholder="Search name, email, subject or message"
                      className="form-input"
                      style={{ width: '100%' }}
                    />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleContactSearch}>Search</button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#6B7280' }}>Unread only</label>
                  <input type="checkbox" checked={contactUnreadOnly} onChange={handleToggleContactFilter} />
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={fetchContactMessages}>Refresh</button>
              </div>
            </div>

            {contactLoading ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading contact messages…</div>
            ) : contactMessages.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No contact messages found.</div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {contactMessages.map((message) => (
                  <div key={message.id} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{message.subject}</div>
                        <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                          {message.name} · {message.email}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge ${message.is_read ? 'badge-gray' : 'badge-yellow'}`}>{message.is_read ? 'Read' : 'Unread'}</span>
                        <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>{new Date(message.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <p style={{ margin: '1rem 0', color: '#374151', lineHeight: 1.75 }}>{message.message}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleMarkMessageRead(message)}>
                        <Eye size={14} /> {message.is_read ? 'Mark unread' : 'Mark read'}
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteMessage(message.id)}>
                        <XCircle size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'user_reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading…</div>}
            {!loading && userReports.length === 0 && <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No user reports submitted yet.</div>}
            {userReports.map(r => (
              <motion.div key={r.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: '#FEE2E2', color: '#B91C1C', width: '42px', height: '42px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h4 style={{ marginBottom: '0.25rem' }}>{r.reason}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                        Reported by <strong>{r.reporter_name}</strong> against <strong>{r.caretaker_name}</strong>
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${r.status === 'pending' ? 'badge-yellow' : r.status === 'resolved' ? 'badge-green' : 'badge-gray'}`}>
                    {r.status.toUpperCase()}
                  </span>
                </div>
                
                <div style={{ margin: '1rem 0', padding: '1rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #E5E7EB', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF' }}>Description</div>
                  {r.description || 'No description provided.'}
                </div>

                {r.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <MessageSquare size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                      <input 
                        type="text" className="form-input" placeholder="Admin notes…" 
                        value={reportNote[r.id] || ''} 
                        onChange={e => setReportNote(prev => ({ ...prev, [r.id]: e.target.value }))}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                    <button onClick={() => handleUpdateReport(r.id, 'resolved')} className="btn btn-success btn-sm">Resolve</button>
                    <button onClick={() => handleUpdateReport(r.id, 'dismissed')} className="btn btn-secondary btn-sm">Dismiss</button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#6B7280', display: 'flex', gap: '1rem' }}>
                    {r.admin_notes && <span><strong>Admin Notes:</strong> {r.admin_notes}</span>}
                    {r.resolved_at && <span><strong>Resolved At:</strong> {new Date(r.resolved_at).toLocaleDateString()}</span>}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* ── TAB: REPORTING (Charts) ── */}
        {tab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="grid-2">
              <div className="card" style={{ padding: '1.5rem', height: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <LineIcon size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.1rem' }}>Booking Trends (Last 30 Days)</h3>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportsData.bookings_trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #EDE9FE', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{ padding: '1.5rem', height: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#10B981' }}>₹</div>
                  <h3 style={{ fontSize: '1.1rem' }}>Revenue Growth</h3>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportsData.revenue_trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #EDE9FE', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid-2">
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <TrendingUp size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.1rem' }}>Top Performing Caretakers</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reportsData.top_caretakers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>No data available</div>
                  ) : reportsData.top_caretakers.map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#F9F7FF', borderRadius: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{i + 1}</div>
                        <span style={{ fontWeight: 600 }}>{t.name}</span>
                      </div>
                      <span className="badge badge-purple">{t.count} Bookings</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ background: '#EDE9FE', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                  <BarChart3 size={32} color="var(--primary)" />
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>Detailed Export</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', maxWidth: '250px', marginBottom: '1.5rem' }}>Download the full system report in CSV or PDF format for offline analysis.</p>
                <button className="btn btn-secondary" onClick={() => alert('Exporting data...')}>Export Report (CSV)</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: SERVICES ── */}
        {tab === 'services' && (
          <div>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Add New Service</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input type="text" className="form-input" placeholder="e.g. Night Shift Care…" value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddService()} style={{ flex: 1 }} />
                <button onClick={handleAddService} className="btn btn-primary">Add Service</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {services.map(s => (
                <div key={s.id} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{s.name}</div>
                    <span className={`badge ${s.active ? 'badge-green' : 'badge-gray'}`}>{s.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <button onClick={() => toggleService(s.id)} className={`btn btn-sm ${s.active ? 'btn-danger' : 'btn-success'}`}>{s.active ? 'Disable' : 'Enable'}</button>
                </div>
              ))}
            </div>
          </div>
        )}
          </main>
          <div className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
