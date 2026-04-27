import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { getNotifications } from '../../api';
import { useAuth } from '../../context/AuthContext';
import CampusMitraAI from '../CampusMitraAI';

const pageTitles = {
  '/book':          'Book a Resource',
  '/resources':     'Available Resources',
  '/my-bookings':   'My Bookings',
  '/notifications': 'Notifications',
  '/booked':        'Booked Resources',
  '/calendar':      'Campus Calendar',
  '/timetable':     'Class Timetable',
  '/analytics':     'Analytics',
  '/map':           'Campus Map',
  '/admin':         'Admin Panel',
  '/dashboard':     'Dashboard',
};

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || 'BookMyCampus';

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await getNotifications(user.id);
        const unread = res.data.notifications?.filter(n => !n.is_read).length || 0;
        setNotifCount(unread);
      } catch {}
    };
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 30000);
    return () => clearInterval(timer);
  }, [user]);

  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        notifCount={notifCount}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />
      <motion.div
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col min-h-screen min-w-0"
      >
        <TopNav notifCount={notifCount} pageTitle={pageTitle} />
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
      <CampusMitraAI />
    </div>
  );
}
