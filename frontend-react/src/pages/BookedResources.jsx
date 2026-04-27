import { useState, useEffect } from 'react';
import { getAllBooked } from '../api';
import { formatDate, formatTime12, RESOURCE_TYPE_COLORS } from '../lib/utils';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { BookOpen, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = ['all', 'classroom', 'lab', 'auditorium', 'sport ground', 'workshop', 'meeting room'];

export default function BookedResources() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    getAllBooked().then(res => setBookings(res.data.bookings || []))
      .catch(() => toast.error('Failed to load booked resources'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    const matchType = typeFilter === 'all' || b.resource_type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || b.resource_name.toLowerCase().includes(q) ||
      b.user_name.toLowerCase().includes(q) || b.location?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Booked Resources</h2>
        <p className="page-subtitle">All approved resource bookings across campus (read-only)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-8" placeholder="Search by name, resource, location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-auto min-w-[160px]" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {loading ? <TableSkeleton rows={5} cols={7} /> : (
        filtered.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">No booked resources found</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Booked By</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const tc = RESOURCE_TYPE_COLORS[b.resource_type] || RESOURCE_TYPE_COLORS.classroom;
                  return (
                    <tr key={b.id}>
                      <td className="text-slate-400 text-xs">{i + 1}</td>
                      <td className="font-medium text-slate-900">{b.resource_name}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                          style={{ background: tc.bg, color: tc.text }}>
                          {b.resource_type}
                        </span>
                      </td>
                      <td className="text-slate-600">{formatDate(b.booking_date)}</td>
                      <td className="text-slate-600 whitespace-nowrap">{formatTime12(b.start_time)} – {formatTime12(b.end_time)}</td>
                      <td className="text-slate-600">{b.location}</td>
                      <td>
                        <div className="font-medium text-slate-800">{b.user_name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{b.user_role}</div>
                      </td>
                      <td className="text-slate-500 max-w-[180px] truncate" title={b.purpose}>{b.purpose}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
