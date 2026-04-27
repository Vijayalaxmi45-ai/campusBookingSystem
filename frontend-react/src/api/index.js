import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

// AUTH
export const registerUser = (data) => API.post('/register', data);
export const loginUser = (data) => API.post('/login', data);
export const googleLogin = (data) => API.post('/google-login', data);

// RESOURCES
export const getResources = () => API.get('/resources');
export const getAvailableResources = () => API.get('/resources/available');
export const addResource = (data) => API.post('/resources', data);
export const updateResource = (id, data) => API.put(`/resources/${id}`, data);
export const deleteResource = (id, data) => API.delete(`/resources/${id}`, { data });

// BOOKINGS
export const createBooking = (data) => API.post('/bookings', data);
export const getBookings = (userId, userRole) =>
  API.get(`/bookings?user_id=${userId}&user_role=${userRole}`);
export const approveBooking = (id, adminRole) =>
  API.put(`/bookings/${id}/approve`, { admin_role: adminRole });
export const rejectBooking = (id, adminRole) =>
  API.put(`/bookings/${id}/reject`, { admin_role: adminRole });
export const deleteBooking = (id, adminRole) =>
  API.delete(`/bookings/${id}`, { data: { admin_role: adminRole } });
export const withdrawBooking = (id, userId) =>
  API.put(`/bookings/${id}/withdraw`, { user_id: userId });
export const getAllBooked = () => API.get('/bookings/all-booked');
export const getCalendarBookings = () => API.get('/bookings/calendar');
export const getSmartSlots = (params) =>
  API.get('/bookings/smart-slots', { params });

// NOTIFICATIONS
export const getNotifications = (userId) =>
  API.get(`/notifications?user_id=${userId}`);
export const markNotificationRead = (id) =>
  API.put(`/notifications/${id}/read`);
export const broadcastNotification = (data) =>
  API.post('/notifications/broadcast', data);

// STATS
export const getResourceStats = () => API.get('/stats/resources');
export const getTypeStats = () => API.get('/stats/types');

// TIMETABLE
export const getTimetable = (params) =>
  API.get('/timetable', { params });

export default API;
