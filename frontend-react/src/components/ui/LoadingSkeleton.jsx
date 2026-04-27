export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 animate-pulse">
      <div className="h-4 bg-slate-200 rounded-lg w-3/4 mb-3" />
      <div className="h-3 bg-slate-100 rounded-lg w-1/2 mb-2" />
      <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="table-wrapper animate-pulse">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><div className="h-3 bg-slate-200 rounded w-full" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j}><div className="h-3 bg-slate-100 rounded w-full" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="stat-card animate-pulse">
      <div className="stat-icon bg-slate-100 w-12 h-12 rounded-2xl" />
      <div className="flex-1">
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
        <div className="h-6 bg-slate-100 rounded w-1/3" />
      </div>
    </div>
  );
}
