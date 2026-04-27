import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead } from '../api';
import { formatDateTime } from '../lib/utils';
import { Bell, CheckCircle, XCircle, Info, RefreshCcw } from 'lucide-react';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const typeConfig = {
  approval:  { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Approved' },
  rejection: { icon: XCircle,     color: 'text-red-600',   bg: 'bg-red-50',   label: 'Rejected' },
  info:      { icon: Info,        color: 'text-blue-600',  bg: 'bg-blue-50',  label: 'Info' },
  reminder:  { icon: Bell,        color: 'text-amber-600', bg: 'bg-amber-50', label: 'Reminder' },
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getNotifications(user.id).then(res => setNotifications(res.data.notifications || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle">Stay updated on your booking status</p>
        </div>
        <button className="btn-secondary" onClick={load}>
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">All caught up!</h3>
          <p className="text-sm text-slate-400">You have no notifications right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((n, i) => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    n.is_read
                      ? 'bg-white border-slate-100 shadow-card opacity-70'
                      : 'bg-white border-primary-100 shadow-card-hover'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{formatDateTime(n.created_at)}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
