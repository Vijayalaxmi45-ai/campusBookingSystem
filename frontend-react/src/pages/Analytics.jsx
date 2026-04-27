import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getResourceStats, getTypeStats } from '../api';
import { RESOURCE_TYPE_COLORS } from '../lib/utils';
import { StatSkeleton } from '../components/ui/LoadingSkeleton';
import { BarChart3, Users, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#f97316', '#0ea5e9'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-card p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      <p className="text-primary-600">{payload[0].value} bookings</p>
    </div>
  );
};

export default function Analytics() {
  const [barData, setBarData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getResourceStats(), getTypeStats()])
      .then(([resStats, typeStats]) => {
        setBarData(resStats.data.stats?.map(s => ({ name: s.resource_name, bookings: s.booking_count, type: s.resource_type })) || []);
        setTypeData(typeStats.data.types?.map(t => ({ name: t.resource_type, value: t.booking_count })) || []);
        setSummary(typeStats.data.summary);
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = summary ? [
    { icon: TrendingUp, label: 'Total Bookings', value: summary.total_bookings, color: 'bg-primary-100 text-primary-600' },
    { icon: CheckCircle, label: 'Approved', value: summary.approved_count, color: 'bg-green-100 text-green-600' },
    { icon: Clock, label: 'Pending', value: summary.pending_count, color: 'bg-amber-100 text-amber-600' },
    { icon: XCircle, label: 'Rejected', value: summary.rejected_count, color: 'bg-red-100 text-red-600' },
    { icon: BarChart3, label: 'Unique Resources', value: summary.unique_resources, color: 'bg-blue-100 text-blue-600' },
    { icon: Users, label: 'Unique Users', value: summary.unique_users, color: 'bg-purple-100 text-purple-600' },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Analytics</h2>
        <p className="page-subtitle">Campus resource usage statistics and trends</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon ${color}`}><Icon size={20} /></div>
              <div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
                <div className="text-2xl font-bold text-slate-900">{value ?? '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-1">Most Used Resources</h3>
          <p className="text-xs text-slate-400 mb-5">Top resources by total booking count</p>
          {barData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No booking data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bookings" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={RESOURCE_TYPE_COLORS[entry.type]?.dot || '#7c3aed'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-1">Resource Utilization by Type</h3>
          <p className="text-xs text-slate-400 mb-5">Booking share across categories</p>
          {typeData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="45%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={3}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} bookings`, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
