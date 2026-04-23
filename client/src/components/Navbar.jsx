import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import {
  LayoutDashboard,
  FilePlus,
  Package,
  Shield,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    API.get('/notifications/unread-count').then((res) => setUnreadCount(res.data.count)).catch(() => {});
    const interval = setInterval(() => {
      API.get('/notifications/unread-count').then((res) => setUnreadCount(res.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report', label: 'Report Item', icon: FilePlus },
    { to: '/my-items', label: 'My Items', icon: Package },
  ];
  if (isAdmin) navLinks.push({ to: '/admin', label: 'Admin', icon: Shield });

  const isActive = (path) => location.pathname === path;
  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm dark:bg-slate-900/80 dark:border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-700 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-700/20 group-hover:shadow-primary-700/40 transition-shadow dark:from-primary-500 dark:to-accent-500">
              UF
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent hidden sm:block dark:from-primary-400 dark:to-accent-400">
              UniFound
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-yellow-300 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle theme"
              id="theme-toggle"
            >
              {isDark ? (
                <Sun className="w-5 h-5 animate-theme-toggle" />
              ) : (
                <Moon className="w-5 h-5 animate-theme-toggle" />
              )}
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className={`relative p-2 rounded-xl transition-all duration-200 ${
                isActive('/notifications')
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
              id="notifications-link"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all duration-200 dark:bg-slate-800 dark:border-slate-600 dark:hover:border-slate-500" id="user-menu-button">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-sm text-slate-600 max-w-[120px] truncate dark:text-slate-300">{user.name}</span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 border border-primary-200 dark:bg-primary-900/50 dark:text-primary-400 dark:border-primary-800">Admin</span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 animate-slide-down overflow-hidden dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate dark:text-slate-500">{user.email}</p>
                    {user.studentId && <p className="text-xs text-slate-400 mt-0.5 dark:text-slate-500">ID: {user.studentId}</p>}
                  </div>
                  <div className="py-1">
                    <div className="md:hidden">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-700">
                            <Icon className="w-4 h-4" />{link.label}
                          </Link>
                        );
                      })}
                      <div className="border-t border-slate-100 my-1 dark:border-slate-700" />
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-950/30" id="logout-button">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
