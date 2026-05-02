import axios from 'axios';

const API_URL = 'https://buddyofcare.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => (await api.post('/auth/login', credentials)).data,
  register: async (userData) => (await api.post('/auth/register', userData)).data,
  getMe: async () => (await api.get('/users/me')).data,
  updateMe: async (payload) => (await api.patch('/users/me', payload)).data,
  changePassword: async (payload) => (await api.patch('/users/me/change-password', payload)).data,
};

export const caretakerService = {
  getAll: async (options = {}) => {
    const {
      skip = 0,
      limit = 100,
      fetchAll = true,
      maxRecords = 5000,
    } = options || {};

    if (!fetchAll) {
      return (await api.get('/caretakers/', { params: { skip, limit } })).data;
    }

    const all = [];
    let currentSkip = skip;
    while (all.length < maxRecords) {
      const page = (await api.get('/caretakers/', { params: { skip: currentSkip, limit } })).data || [];
      all.push(...page);
      if (page.length < limit) break;
      currentSkip += limit;
    }
    return all;
  },
  getById: async (id) => (await api.get(`/caretakers/${id}`)).data,
  getByUserId: async (userId) => (await api.get(`/caretakers/by-user/${userId}`)).data,
  create: async (data) => (await api.post('/caretakers/', data)).data,
  update: async (id, data) => (await api.put(`/caretakers/${id}`, data)).data,
  getMe: async () => (await api.get('/caretakers/me')).data,
  updateMe: async (payload) => (await api.patch('/caretakers/me', payload)).data,
  updateMyWages: async (wages_price) => (await api.patch('/caretakers/me/price', { wages_price })).data,
};

export const bookingService = {
  create: async (data) => (await api.post('/bookings/', data)).data,
  getUserBookings: async () => (await api.get('/bookings/')).data,
  getById: async (id) => (await api.get(`/bookings/${id}`)).data,
  confirm: async (id) => (await api.patch(`/bookings/${id}/confirm`)).data,
};

export const reviewService = {
  createReview: async (data) => (await api.post('/reviews/', data)).data,
  getReviewsForCaretaker: async (caretakerId) => (await api.get(`/reviews/caretaker/${caretakerId}`)).data,
};

export const paymentService = {
  create: async (data) => (await api.post('/payments/', data)).data,
  getById: async (id) => (await api.get(`/payments/${id}`)).data,
};

export const reportService = {
  create: async (data) => (await api.post('/reports/', data)).data,
  getMyReports: async () => (await api.get('/reports/my-reports')).data,
};

export const adminService = {
  getPendingBookings: async () => (await api.get('/admin/bookings/pending')).data,
  getActiveBookings: async (params) => (await api.get('/admin/bookings/active', { params })).data,
  getBookingDetails: async (id) => (await api.get(`/admin/bookings/${id}`)).data,
  approveBooking: async (id) => (await api.patch(`/admin/bookings/${id}/approve`)).data,
  rejectBooking: async (id, reason) => (await api.patch(`/admin/bookings/${id}/reject`, { reason })).data,
  getStats: async () => (await api.get('/admin/stats')).data,
  getReports: async () => (await api.get('/admin/reports/summary')).data,
  getUserReports: async () => (await api.get('/admin/reports')).data,
  updateUserReport: async (id, data) => (await api.patch(`/admin/reports/${id}`, null, { params: data })).data,
  getContactMessages: async (params = {}) => (await api.get('/admin/contact-messages', { params })).data,
  updateContactMessage: async (id, data) => (await api.patch(`/admin/contact-messages/${id}`, data)).data,
  deleteContactMessage: async (id) => (await api.delete(`/admin/contact-messages/${id}`)).data,
  setup: async (setupData) => (await api.post('/admin/setup', setupData)).data,
};

export const contactService = {
  send: async (payload) => (await api.post('/contact', payload)).data,
};

export default api;
