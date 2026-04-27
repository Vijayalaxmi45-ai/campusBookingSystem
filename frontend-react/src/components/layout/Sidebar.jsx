import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDays, Building2, BookMarked, Bell, BookOpen,
  CalendarRange, BarChart3, MapPin, Settings, GraduationCap,
  LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const studentNav = [
  { to: '/book',          icon: CalendarDays,  label: 'Book Resource' },
  { to: '/resources',     icon: Building2,     label: 'Resources' },
  { to: '/my-bookings',   icon: BookMarked,    label: 'My Bookings' },
  { to: '/notifications', icon: Bell,          label: 'Notifications' },
  { to: '/booked',        icon: BookOpen,      label: 'Booked Resources' },
  { to: '/calendar',      icon: CalendarRange, label: 'Campus Calendar' },
  { to: '/timetable',     icon: GraduationCap, label: 'Class Timetable' },
  { to: '/analytics',     icon: BarChart3,     label: 'Analytics' },
  { to: '/map',           icon: MapPin,        label: 'Campus Map' },
];

const adminNav = [
  { to: '/resources',     icon: Building2,     label: 'Resources' },
  { to: '/notifications', icon: Bell,          label: 'Notifications' },
  { to: '/booked',        icon: BookOpen,      label: 'Booked Resources' },
  { to: '/calendar',      icon: CalendarRange, label: 'Campus Calendar' },
  { to: '/timetable',     icon: GraduationCap, label: 'Class Timetable' },
  { to: '/analytics',     icon: BarChart3,     label: 'Analytics' },
  { to: '/map',           icon: MapPin,        label: 'Campus Map' },
  { to: '/admin',         icon: Settings,      label: 'Admin Panel' },
];

export default function Sidebar({ notifCount = 0, collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === 'admin' ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen bg-white border-r border-slate-100 flex flex-col z-30 overflow-hidden flex-shrink-0"
      style={{ position: 'fixed', top: 0, left: 0, bottom: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 min-h-[64px]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center flex-shrink-0 shadow-glow">
          <GraduationCap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="font-bold text-slate-900 text-sm leading-tight">BookMyCampus</div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">Campus Resource System</div>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-150 flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'nav-link-active' : 'nav-link'
            }
            title={collapsed ? label : undefined}
          >
            <div className="relative flex-shrink-0">
              <Icon size={18} />
              {label === 'Notifications' && notifCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="truncate"
              >
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-2 pb-4 border-t border-slate-100 pt-3">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">{user?.name}</div>
              <div className="text-[10px] text-primary-600 font-semibold capitalize">{user?.role}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`mt-1 w-full flex items-center gap-3 px-2 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-xs font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
