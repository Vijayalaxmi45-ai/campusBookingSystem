import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getResources } from '../api';
import { RESOURCE_TYPE_COLORS, RESOURCE_TYPES } from '../lib/utils';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import StatusBadge from '../components/ui/StatusBadge';
import { Building2, Users, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const FILTERS = ['all', ...RESOURCE_TYPES];
const FILTER_LABELS = {
  all: 'All',
  classroom: 'Classrooms',
  lab: 'Labs',
  auditorium: 'Auditoriums',
  'sport ground': 'Sports',
  workshop: 'Workshops',
  'meeting room': 'Meeting Rooms',
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getResources().then(res => {
      setResources(res.data.resources || []);
    }).catch(() => toast.error('Failed to load resources'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? resources : resources.filter(r => r.type === filter);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Available Resources</h2>
        <p className="page-subtitle">View all campus facilities and their current status</p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? 'filter-pill-active' : 'filter-pill'}>
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">No resources found</h3>
          <p className="text-sm text-slate-400">Try a different filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((res, i) => {
            const typeStyle = RESOURCE_TYPE_COLORS[res.type] || RESOURCE_TYPE_COLORS.classroom;
            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{res.name}</h3>
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                      style={{ background: typeStyle.bg, color: typeStyle.text }}
                    >
                      {res.type}
                    </span>
                  </div>
                  <StatusBadge status={res.status} type="resource" />
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                    {res.building}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                    Floor {res.floor_no} · Room {res.room_no}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-slate-400 flex-shrink-0" />
                    Capacity: {res.capacity} people
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
