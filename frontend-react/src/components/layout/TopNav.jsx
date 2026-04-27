import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopNav({ notifCount = 0, pageTitle = '' }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleColor = {
    admin:   'bg-purple-100 text-purple-700',
    faculty: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
  }[user?.role] || 'bg-slate-100 text-slate-600';

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 sticky top-0 z-20">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        {pageTitle && (
          <h1 className="text-lg font-semibold text-slate-800 truncate">{pageTitle}</h1>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-150"
        >
          <Bell size={18} />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        {/* User pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
          {user?.picture ? (
            <img src={user.picture} alt="User" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize ${roleColor}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
