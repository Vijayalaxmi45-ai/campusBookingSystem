import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getBookings, withdrawBooking } from '../api';
import { formatDate, formatTime12 } from '../lib/utils';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { BookMarked, Calendar, Clock, MapPin, FileText, QrCode, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [qrModal, setQrModal] = useState(null);

  const load = () => {
    setLoading(true);
    getBookings(user.id, user.role).then(res => {
      setBookings(res.data.bookings || []);
    }).catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleWithdraw = async () => {
    try {
      await withdrawBooking(confirm.id, user.id);
      toast.success('Booking withdrawn');
      setConfirm({ open: false, id: null });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to withdraw');
    }
  };

  const addToGoogleCalendar = (b) => {
    const start = `${b.booking_date}T${b.start_time}`.replace(/-|:/g, '');
    const end = `${b.booking_date}T${b.end_time}`.replace(/-|:/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(b.resource_name)}&dates=${start}/${end}&details=${encodeURIComponent(b.purpose)}&location=${encodeURIComponent(b.location)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Bookings</h2>
        <p className="page-subtitle">Manage your resource bookings and track approvals</p>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <BookMarked size={48} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">No bookings yet</h3>
          <p className="text-sm text-slate-400">Go to "Book Resource" to make your first booking</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {bookings.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="card"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{b.resource_name}</h3>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{b.resource_type}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { icon: Calendar, label: 'Date', value: formatDate(b.booking_date) },
                    { icon: Clock, label: 'Time', value: `${formatTime12(b.start_time)} – ${formatTime12(b.end_time)}` },
                    { icon: MapPin, label: 'Location', value: b.location },
                    { icon: FileText, label: 'Purpose', value: b.purpose },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        <Icon size={10} /> {label}
                      </div>
                      <div className="text-xs text-slate-700 font-medium">{value}</div>
                    </div>
                  ))}
                </div>

                {b.status === 'approved' && b.qr_code && (
                  <div className="flex items-center gap-3 bg-primary-50 rounded-xl p-3 mb-4">
                    <img src={b.qr_code} alt="QR" className="w-14 h-14 rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-primary-200"
                      onClick={() => setQrModal(b)} />
                    <div>
                      <div className="text-xs font-semibold text-primary-700 flex items-center gap-1"><QrCode size={12} /> QR Entry Pass</div>
                      <div className="text-[11px] text-primary-500 mt-0.5">Click to enlarge · Show at entry</div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(b.status === 'pending' || b.status === 'approved') && (
                    <button className="btn-danger text-xs py-1.5 px-3" onClick={() => setConfirm({ open: true, id: b.id })}>
                      Withdraw
                    </button>
                  )}
                  {b.status === 'approved' && (
                    <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => addToGoogleCalendar(b)}>
                      📅 Add to Google Calendar
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Withdraw Booking"
        message="Are you sure you want to withdraw this booking? This action cannot be undone."
        confirmText="Withdraw"
        onConfirm={handleWithdraw}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      {/* QR Modal */}
      <AnimatePresence>
        {qrModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQrModal(null)}>
            <motion.div
              className="modal-box p-8 flex flex-col items-center text-center max-w-sm"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" onClick={() => setQrModal(null)}><X size={20} /></button>
              <div className="text-sm font-bold text-slate-900 mb-1">{qrModal.resource_name}</div>
              <div className="text-xs text-slate-500 mb-4">{formatDate(qrModal.booking_date)} · {formatTime12(qrModal.start_time)} – {formatTime12(qrModal.end_time)}</div>
              <img src={qrModal.qr_code} alt="QR Code" className="w-56 h-56 rounded-2xl border border-primary-200" />
              <p className="text-xs text-slate-400 mt-4">Show this QR code at the entry gate</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
