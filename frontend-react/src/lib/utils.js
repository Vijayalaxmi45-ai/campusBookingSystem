export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime12(t) {
  if (!t) return '';
  const parts = t.split(':');
  const hr = parseInt(parts[0]);
  const m = parts[1] || '00';
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const hr12 = hr % 12 || 12;
  return `${hr12}:${m} ${ampm}`;
}

export function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });
}

export function clsxm(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const RESOURCE_TYPES = [
  'classroom', 'lab', 'auditorium', 'sport ground', 'workshop', 'meeting room'
];

export const RESOURCE_TYPE_COLORS = {
  classroom:     { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  lab:           { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  auditorium:    { bg: '#ede9fe', text: '#6d28d9', dot: '#7c3aed' },
  'sport ground':{ bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  workshop:      { bg: '#ffedd5', text: '#c2410c', dot: '#f97316' },
  'meeting room':{ bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' },
};

export const CALENDAR_EVENT_COLORS = {
  classroom:     '#22c55e',
  lab:           '#3b82f6',
  auditorium:    '#8b5cf6',
  'sport ground':'#f59e0b',
  workshop:      '#f97316',
  'meeting room':'#0ea5e9',
};

export function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentYearMax() {
  return `${new Date().getFullYear()}-12-31`;
}
