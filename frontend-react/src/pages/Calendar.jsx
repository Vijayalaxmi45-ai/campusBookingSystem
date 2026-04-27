import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getCalendarBookings } from '../api';
import { CALENDAR_EVENT_COLORS, formatTime12, formatDate } from '../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const FILTERS = ['all', 'classroom', 'lab', 'auditorium', 'sport ground', 'workshop', 'meeting room'];

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [popup, setPopup] = useState(null);
  const calRef = useRef(null);

  useEffect(() => {
    getCalendarBookings().then(res => {
      const bookings = res.data.bookings || [];
      const evts = bookings.map(b => ({
        id: b.id,
        title: b.resource_name,
        start: `${b.booking_date}T${b.start_time}`,
        end: `${b.booking_date}T${b.end_time}`,
        backgroundColor: CALENDAR_EVENT_COLORS[b.resource_type] || '#7c3aed',
        borderColor: 'transparent',
        extendedProps: b,
      }));
      setAllEvents(evts);
      setEvents(evts);
    }).catch(() => toast.error('Failed to load calendar'));
  }, []);

  useEffect(() => {
    if (filter === 'all') setEvents(allEvents);
    else setEvents(allEvents.filter(e => e.extendedProps.resource_type === filter));
  }, [filter, allEvents]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Campus Calendar</h2>
        <p className="page-subtitle">View all approved bookings across campus</p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? 'filter-pill-active' : 'filter-pill'}>
            {f === 'all' ? 'All Resources' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {Object.entries(CALENDAR_EVENT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4">
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            events={events}
            eventClick={(info) => setPopup(info.event.extendedProps)}
            height={600}
            eventDisplay="block"
          />
        </div>
      </div>

      {/* Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPopup(null)}>
            <motion.div className="modal-box p-6 max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-900">{popup.resource_name}</h3>
                <button onClick={() => setPopup(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Type', popup.resource_type],
                  ['Date', formatDate(popup.booking_date)],
                  ['Time', `${formatTime12(popup.start_time)} – ${formatTime12(popup.end_time)}`],
                  ['Location', popup.location],
                  ['Booked by', `${popup.user_name} (${popup.user_role})`],
                  ['Purpose', popup.purpose],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-400 w-24 flex-shrink-0">{k}</span>
                    <span className="text-slate-700 font-medium capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
