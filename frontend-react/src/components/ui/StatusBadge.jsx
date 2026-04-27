export default function StatusBadge({ status, type = 'booking' }) {
  const bookingMap = {
    approved: 'bg-green-100 text-green-700 border-green-200',
    pending:  'bg-amber-100 text-amber-700 border-amber-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };
  const resourceMap = {
    available:   'bg-green-100 text-green-700 border-green-200',
    occupied:    'bg-red-100 text-red-700 border-red-200',
    maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  const map = type === 'resource' ? resourceMap : bookingMap;
  const cls = map[status] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status?.toUpperCase()}
    </span>
  );
}
