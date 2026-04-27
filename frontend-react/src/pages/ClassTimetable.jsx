import { useState, useEffect } from 'react';
import { getTimetable } from '../api';
import { formatTime12 } from '../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TYPE_COLORS = {
  Lecture:   'bg-blue-100 text-blue-800 border-blue-200',
  Lab:       'bg-green-100 text-green-800 border-green-200',
  Practical: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function ClassTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState('Monday');
  const [dept, setDept] = useState('');
  const [sem, setSem] = useState('');
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    getTimetable().then(res => {
      const data = res.data.timetable || [];
      window.allTimetableData = data; // expose for CampusMitra AI
      setTimetable(data);
    }).catch(() => toast.error('Failed to load timetable'))
      .finally(() => setLoading(false));
  }, []);

  const depts = [...new Set(timetable.map(t => t.department).filter(Boolean))].sort();
  const sems = [...new Set(timetable.map(t => t.semester).filter(Boolean))].sort((a,b)=>a-b);

  const filtered = timetable.filter(t =>
    t.day === day &&
    (!dept || t.department === dept) &&
    (!sem || String(t.semester) === String(sem))
  ).sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div>
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 shadow-lg text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Class Timetable
          </h2>
          <p className="text-primary-100 mt-1 font-medium">Weekly class schedule across campus</p>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-1 flex-wrap mb-4 bg-slate-100 p-1 rounded-xl w-fit">
        {DAYS.map(d => (
          <button key={d} onClick={() => setDay(d)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              day === d ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="select w-auto min-w-[180px]" value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="select w-auto min-w-[140px]" value={sem} onChange={e => setSem(e.target.value)}>
          <option value="">All Semesters</option>
          {sems.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        {(dept || sem) && (
          <button className="btn-ghost" onClick={() => { setDept(''); setSem(''); }}>Reset</button>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        {Object.entries(TYPE_COLORS).map(([type, cls]) => (
          <div key={type} className={`px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>{type}</div>
        ))}
      </div>

      {loading ? (
        <div className="card animate-pulse h-40" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <GraduationCap size={48} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">No classes found</h3>
          <p className="text-sm text-slate-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr className="bg-primary-600"><th className="!text-white border-b-0 !bg-primary-600 rounded-tl-xl py-3 px-4 font-semibold text-sm">Time</th><th className="!text-white border-b-0 !bg-primary-600 py-3 px-4 font-semibold text-sm">Subject</th><th className="!text-white border-b-0 !bg-primary-600 py-3 px-4 font-semibold text-sm">Faculty</th><th className="!text-white border-b-0 !bg-primary-600 py-3 px-4 font-semibold text-sm">Class</th><th className="!text-white border-b-0 !bg-primary-600 py-3 px-4 font-semibold text-sm">Room</th><th className="!text-white border-b-0 !bg-primary-600 py-3 px-4 font-semibold text-sm">Department</th><th className="!text-white border-b-0 !bg-primary-600 py-3 px-4 font-semibold text-sm text-center">Sem</th><th className="!text-white border-b-0 !bg-primary-600 rounded-tr-xl py-3 px-4 font-semibold text-sm">Type</th></tr></thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i} className="cursor-pointer" onClick={() => setPopup(t)}>
                  <td className="whitespace-nowrap font-mono text-xs text-slate-600">{formatTime12(t.start_time)} – {formatTime12(t.end_time)}</td>
                  <td className="font-medium text-slate-900">{t.subject}</td>
                  <td className="text-slate-600">{t.faculty}</td>
                  <td className="text-slate-500">{t.class_name}</td>
                  <td className="text-slate-500">{t.room_name}</td>
                  <td className="text-slate-500">{t.department}</td>
                  <td className="text-center text-slate-500">{t.semester}</td>
                  <td><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${TYPE_COLORS[t.type] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{t.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setPopup(null)}>
            <motion.div className="modal-box p-6 max-w-sm" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onClick={e=>e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{popup.subject}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TYPE_COLORS[popup.type] || ''}`}>{popup.type}</span>
                </div>
                <button onClick={() => setPopup(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Faculty', popup.faculty],
                  ['Room', `${popup.room_name} (${popup.building}, ${popup.room_no})`],
                  ['Time', `${formatTime12(popup.start_time)} – ${formatTime12(popup.end_time)}`],
                  ['Department', popup.department],
                  ['Semester', popup.semester],
                  ['Class', popup.class_name],
                ].map(([k,v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-slate-400 w-24 flex-shrink-0 text-xs">{k}</span>
                    <span className="text-slate-700 font-medium text-xs">{v}</span>
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
