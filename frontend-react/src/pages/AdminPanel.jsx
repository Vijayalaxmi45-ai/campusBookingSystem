import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getBookings, approveBooking, rejectBooking, deleteBooking,
  getResources, addResource, updateResource, deleteResource,
  broadcastNotification
} from '../api';
import { formatDate, formatTime12, RESOURCE_TYPES } from '../lib/utils';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { TableSkeleton, CardSkeleton } from '../components/ui/LoadingSkeleton';
import { Check, X, Trash2, Plus, Edit2, Building2, Megaphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'bookings', label: 'Manage Bookings' },
  { id: 'resources', label: 'Manage Resources' },
  { id: 'broadcast', label: 'Broadcast' },
];

const emptyRes = { name: '', type: '', building: '', floor_no: '', room_no: '', capacity: '', status: 'available' };

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingB, setLoadingB] = useState(true);
  const [loadingR, setLoadingR] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, action: null, id: null, label: '' });
  const [modal, setModal] = useState({ open: false, editing: null });
  const [resForm, setResForm] = useState(emptyRes);
  const [saving, setSaving] = useState(false);
  const [broadcast, setBroadcast] = useState({ message: '', type: 'info', target_role: 'all' });
  const [broadcasting, setBroadcasting] = useState(false);

  const loadBookings = () => {
    setLoadingB(true);
    getBookings(user.id, 'admin').then(r => setBookings(r.data.bookings || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoadingB(false));
  };
  const loadResources = () => {
    setLoadingR(true);
    getResources().then(r => setResources(r.data.resources || []))
      .catch(() => toast.error('Failed to load resources'))
      .finally(() => setLoadingR(false));
  };

  useEffect(() => { loadBookings(); loadResources(); }, []);

  // Booking actions
  const doConfirm = async () => {
    const { action, id } = confirm;
    setConfirm(c => ({ ...c, open: false }));
    try {
      if (action === 'approve') { await approveBooking(id, 'admin'); toast.success('Booking approved'); }
      else if (action === 'reject') { await rejectBooking(id, 'admin'); toast.success('Booking rejected'); }
      else if (action === 'deleteBooking') { await deleteBooking(id, 'admin'); toast.success('Booking deleted'); }
      else if (action === 'deleteResource') { await deleteResource(id, { admin_role: 'admin' }); toast.success('Resource deleted'); loadResources(); return; }
      loadBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Action failed'); }
  };

  // Resource modal
  const openAdd = () => { setResForm(emptyRes); setModal({ open: true, editing: null }); };
  const openEdit = (r) => { setResForm({ name: r.name, type: r.type, building: r.building, floor_no: r.floor_no, room_no: r.room_no, capacity: r.capacity, status: r.status }); setModal({ open: true, editing: r.id }); };
  const saveResource = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...resForm, admin_role: 'admin' };
      if (modal.editing) await updateResource(modal.editing, payload);
      else await addResource(payload);
      toast.success(modal.editing ? 'Resource updated' : 'Resource added');
      setModal({ open: false, editing: null }); loadResources();
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault(); setBroadcasting(true);
    try {
      await broadcastNotification({ ...broadcast, admin_role: 'admin' });
      toast.success(`Broadcast sent to ${broadcast.target_role}`);
      setBroadcast({ message: '', type: 'info', target_role: 'all' });
    } catch (err) { toast.error(err?.response?.data?.message || 'Broadcast failed'); }
    finally { setBroadcasting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Admin Panel</h2>
        <p className="page-subtitle">Manage bookings, resources, and campus notifications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
              tab === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Manage Bookings */}
      {tab === 'bookings' && (
        loadingB ? <TableSkeleton rows={5} cols={6} /> : bookings.length === 0 ? (
          <div className="empty-state"><Building2 size={48} className="text-slate-200 mb-4" /><h3 className="text-lg font-semibold text-slate-600">No booking requests</h3></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Resource</th><th>User</th><th>Date & Time</th><th>Purpose</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td><div className="font-medium text-slate-900">{b.resource_name}</div><div className="text-[10px] text-slate-400 capitalize">{b.resource_type}</div></td>
                    <td><div className="font-medium text-slate-800">{b.user_name}</div><div className="text-[10px] text-slate-400 capitalize">{b.user_role}</div></td>
                    <td className="whitespace-nowrap text-xs text-slate-600">{formatDate(b.booking_date)}<br/>{formatTime12(b.start_time)} – {formatTime12(b.end_time)}</td>
                    <td className="max-w-[160px] truncate text-xs text-slate-500" title={b.purpose}>{b.purpose}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap">
                        {b.status === 'pending' && <button className="btn-success text-xs py-1 px-2" onClick={() => setConfirm({ open: true, action: 'approve', id: b.id, label: 'approve this booking' })}><Check size={12} /></button>}
                        {(b.status === 'pending' || b.status === 'approved') && <button className="btn-danger text-xs py-1 px-2" onClick={() => setConfirm({ open: true, action: 'reject', id: b.id, label: 'reject this booking' })}><X size={12} /></button>}
                        <button className="btn-danger text-xs py-1 px-2" onClick={() => setConfirm({ open: true, action: 'deleteBooking', id: b.id, label: 'delete this booking' })}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Manage Resources */}
      {tab === 'resources' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500">{resources.length} resources</p>
            <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Resource</button>
          </div>
          {loadingR ? <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><CardSkeleton key={i}/>)}</div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Name</th><th>Type</th><th>Location</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {resources.map(r => (
                    <tr key={r.id}>
                      <td className="font-medium text-slate-900">{r.name}</td>
                      <td className="capitalize text-xs text-slate-500">{r.type}</td>
                      <td className="text-xs text-slate-500">{r.building} · Floor {r.floor_no} · {r.room_no}</td>
                      <td className="text-xs text-slate-500">{r.capacity}</td>
                      <td><StatusBadge status={r.status} type="resource" /></td>
                      <td>
                        <div className="flex gap-1.5">
                          <button className="btn-secondary text-xs py-1 px-2" onClick={() => openEdit(r)}><Edit2 size={12} /></button>
                          <button className="btn-danger text-xs py-1 px-2" onClick={() => setConfirm({ open: true, action: 'deleteResource', id: r.id, label: 'delete this resource' })}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Broadcast */}
      {tab === 'broadcast' && (
        <div className="max-w-lg">
          <div className="card">
            <div className="flex items-center gap-2 mb-5"><Megaphone size={18} className="text-primary-600" /><h3 className="font-semibold text-slate-800">Send Broadcast Notification</h3></div>
            <form onSubmit={sendBroadcast} className="space-y-4">
              <div><label className="input-label">Message</label><textarea className="textarea" rows={4} placeholder="Write your announcement…" value={broadcast.message} onChange={e => setBroadcast(b=>({...b,message:e.target.value}))} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">Type</label>
                  <select className="select" value={broadcast.type} onChange={e => setBroadcast(b=>({...b,type:e.target.value}))}>
                    <option value="info">Info</option><option value="reminder">Reminder</option><option value="approval">Approval</option><option value="rejection">Rejection</option>
                  </select>
                </div>
                <div><label className="input-label">Target</label>
                  <select className="select" value={broadcast.target_role} onChange={e => setBroadcast(b=>({...b,target_role:e.target.value}))}>
                    <option value="all">Everyone</option><option value="student">Students</option><option value="faculty">Faculty</option><option value="admin">Admins</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={broadcasting} className="btn-primary w-full justify-center">
                {broadcasting ? <><Loader2 size={16} className="animate-spin"/>Sending…</> : <><Megaphone size={16}/>Send Broadcast</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirm.open} title="Confirm Action" message={`Are you sure you want to ${confirm.label}?`} onConfirm={doConfirm} onCancel={() => setConfirm(c=>({...c,open:false}))} />

      {/* Resource Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setModal({open:false,editing:null})}>
            <motion.div className="modal-box p-6" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onClick={e=>e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-slate-900">{modal.editing ? 'Edit Resource' : 'Add New Resource'}</h3>
                <button onClick={() => setModal({open:false,editing:null})} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
              </div>
              <form onSubmit={saveResource} className="space-y-4">
                <div><label className="input-label">Name *</label><input className="input" placeholder="e.g. Computer Lab 3" value={resForm.name} onChange={e=>setResForm(f=>({...f,name:e.target.value}))} required /></div>
                <div><label className="input-label">Type *</label>
                  <select className="select" value={resForm.type} onChange={e=>setResForm(f=>({...f,type:e.target.value}))} required>
                    <option value="">— Select type —</option>
                    {RESOURCE_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="input-label">Building *</label><input className="input" placeholder="Block A" value={resForm.building} onChange={e=>setResForm(f=>({...f,building:e.target.value}))} required /></div>
                  <div><label className="input-label">Floor *</label><input className="input" placeholder="2" value={resForm.floor_no} onChange={e=>setResForm(f=>({...f,floor_no:e.target.value}))} required /></div>
                  <div><label className="input-label">Room No *</label><input className="input" placeholder="203" value={resForm.room_no} onChange={e=>setResForm(f=>({...f,room_no:e.target.value}))} required /></div>
                  <div><label className="input-label">Capacity *</label><input type="number" className="input" placeholder="50" value={resForm.capacity} onChange={e=>setResForm(f=>({...f,capacity:e.target.value}))} required /></div>
                </div>
                <div><label className="input-label">Status</label>
                  <select className="select" value={resForm.status} onChange={e=>setResForm(f=>({...f,status:e.target.value}))}>
                    <option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" className="btn-secondary" onClick={()=>setModal({open:false,editing:null})}>Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary">{saving ? <><Loader2 size={14} className="animate-spin"/>Saving…</> : 'Save Resource'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
