import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getResources, createBooking, getSmartSlots
} from '../api';
import toast from 'react-hot-toast';
import { RESOURCE_TYPE_COLORS, formatTime12, getTodayStr, getCurrentYearMax } from '../lib/utils';
import {
  Building2, Clock, CalendarDays, FileText, CheckCircle2,
  AlertCircle, Lightbulb, Loader2, Info, Users
} from 'lucide-react';

export default function BookResource() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [selectedRes, setSelectedRes] = useState(null);
  const [form, setForm] = useState({
    resource_id: '', booking_date: '', start_time: '', end_time: '', purpose: ''
  });
  const [smartSlot, setSmartSlot] = useState(null);
  const [checkingSlot, setCheckingSlot] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getResources().then(res => {
      let data = res.data.resources || [];
      if (user?.role === 'student') {
        data = data.filter(r => ['sport ground', 'auditorium'].includes(r.type));
      } else if (user?.role === 'faculty') {
        data = data.filter(r => ['lab', 'classroom', 'meeting room', 'auditorium', 'workshop'].includes(r.type));
      }
      setResources(data);
    }).catch(() => toast.error('Failed to load resources'));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'resource_id') {
      setSelectedRes(resources.find(r => r.id == value) || null);
      setSmartSlot(null);
    }
    if (['start_time', 'end_time', 'booking_date'].includes(name)) setSmartSlot(null);
  };

  const checkAvailability = async () => {
    const { resource_id, booking_date, start_time, end_time } = form;
    if (!resource_id || !booking_date || !start_time || !end_time) {
      return toast.error('Fill in Resource, Date, Start & End Time first');
    }
    if (start_time >= end_time) return toast.error('End time must be after start time');
    setCheckingSlot(true);
    try {
      const res = await getSmartSlots({ resource_id, desired_date: booking_date, start_time, end_time, user_role: user.role });
      setSmartSlot(res.data);
    } catch { toast.error('Could not check availability'); }
    finally { setCheckingSlot(false); }
  };

  const applySlot = (start, end) => {
    setForm(f => ({ ...f, start_time: start, end_time: end }));
    setSmartSlot(null);
    toast.success('Slot applied!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resource_id) return toast.error('Select a resource');
    if (form.start_time >= form.end_time) return toast.error('End time must be after start time');
    const yr = new Date(form.booking_date).getFullYear();
    if (yr > new Date().getFullYear()) return toast.error(`Bookings only allowed till Dec 31, ${new Date().getFullYear()}`);
    setSubmitting(true);
    try {
      const res = await createBooking({
        user_id: user.id, user_name: user.name, user_role: user.role,
        resource_id: form.resource_id, start_time: form.start_time,
        end_time: form.end_time, booking_date: form.booking_date, purpose: form.purpose
      });
      if (res.data.success) {
        toast.success('Booking submitted! Awaiting admin approval.');
        setForm({ resource_id: '', booking_date: '', start_time: '', end_time: '', purpose: '' });
        setSelectedRes(null); setSmartSlot(null);
      } else {
        toast.error(res.data.message || 'Booking failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  const typeStyle = selectedRes ? RESOURCE_TYPE_COLORS[selectedRes.type] : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="page-header">
        <h2 className="page-title">Book a Resource</h2>
        <p className="page-subtitle">Reserve campus facilities for your activities</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Resource + Date Row */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
            <Building2 size={16} className="text-primary-500" /> Resource Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="input-label">Select Resource *</label>
              <select name="resource_id" className="select" value={form.resource_id} onChange={handleChange} required>
                <option value="">— Choose a resource —</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id} disabled={r.status !== 'available'}>
                    {r.name} ({r.type}) {r.status !== 'available' ? `— ${r.status}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedRes && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="col-span-2 rounded-xl p-4 flex items-start gap-3"
                style={{ background: typeStyle?.bg }}
              >
                <Info size={16} style={{ color: typeStyle?.text }} className="mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1" style={{ color: typeStyle?.text }}>
                  <div className="font-semibold">{selectedRes.name}</div>
                  <div>{selectedRes.building} · Floor {selectedRes.floor_no} · Room {selectedRes.room_no}</div>
                  <div className="flex items-center gap-1"><Users size={12} /> Capacity: {selectedRes.capacity} people</div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="input-label">Name</label>
              <input className="input bg-slate-50" value={user?.name} readOnly />
            </div>
            <div>
              <label className="input-label">Role</label>
              <input className="input bg-slate-50 capitalize" value={user?.role} readOnly />
            </div>
          </div>
        </div>

        {/* Time + Date */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
            <Clock size={16} className="text-primary-500" /> Schedule
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label">Date *</label>
              <input type="date" name="booking_date" className="input" value={form.booking_date} onChange={handleChange}
                min={getTodayStr()} max={getCurrentYearMax()} required />
            </div>
            <div>
              <label className="input-label">Start Time *</label>
              <input type="time" name="start_time" className="input" value={form.start_time} onChange={handleChange} required />
            </div>
            <div>
              <label className="input-label">End Time *</label>
              <input type="time" name="end_time" className="input" value={form.end_time} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="input-label">Purpose *</label>
            <textarea name="purpose" className="textarea" rows={3} placeholder="Describe the purpose of your booking…" value={form.purpose} onChange={handleChange} required />
          </div>

          <button type="button" onClick={checkAvailability} disabled={checkingSlot} className="btn-secondary w-full justify-center">
            {checkingSlot ? <><Loader2 size={16} className="animate-spin" /> Checking…</> : '🔍 Check Availability'}
          </button>
        </div>

        {/* Smart Slot Panel */}
        {smartSlot && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${smartSlot.available ? 'bg-green-50' : 'bg-red-50'}`}>
              {smartSlot.available
                ? <><CheckCircle2 size={20} className="text-green-600 flex-shrink-0" /><span className="text-sm font-semibold text-green-800">Slot is available! You can proceed.</span></>
                : <><AlertCircle size={20} className="text-red-600 flex-shrink-0" /><span className="text-sm font-semibold text-red-800">Slot unavailable — conflicts detected.</span></>
              }
            </div>

            {!smartSlot.available && (
              <>
                {smartSlot.timetable_conflicts?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Timetable Conflicts</p>
                    {smartSlot.timetable_conflicts.map((t, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-3 mb-1 text-xs text-blue-800">
                        <span className="font-semibold">{t.subject}</span> — {t.faculty} · {t.time}
                      </div>
                    ))}
                  </div>
                )}
                {smartSlot.booking_conflicts?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Booking Conflicts</p>
                    {smartSlot.booking_conflicts.map((c, i) => (
                      <div key={i} className="bg-amber-50 rounded-lg p-3 mb-1 text-xs text-amber-800">
                        {c.time} — <span className="font-semibold">{c.status?.toUpperCase()}</span>
                        {c.booked_by && ` · ${c.booked_by}`}
                      </div>
                    ))}
                  </div>
                )}
                {smartSlot.recommendations?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Lightbulb size={12} className="text-amber-500" /> Recommended Slots
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {smartSlot.recommendations.map((r, i) => (
                        <button key={i} type="button" onClick={() => applySlot(r.start_time, r.end_time)}
                          className="bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl p-3 text-left transition-all duration-150">
                          <div className="text-xs font-semibold text-primary-700">
                            {formatTime12(r.start_time)} – {formatTime12(r.end_time)}
                          </div>
                          <div className="text-[10px] text-primary-500 mt-0.5">Click to apply →</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 text-base">
          {submitting
            ? <><Loader2 size={18} className="animate-spin" /> Submitting…</>
            : <><CalendarDays size={18} /> Submit Booking Request</>
          }
        </button>
      </form>
    </div>
  );
}
