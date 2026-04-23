import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Bell, Check } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/notifications')
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Notifications</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2 dark:bg-slate-700" />
              <div className="h-3 bg-slate-100 rounded w-1/3 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-slate-600 mb-2 dark:text-slate-300">No notifications</h3>
          <p className="text-slate-400 dark:text-slate-500">You'll be notified when someone claims one of your items.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => (
            <div
              key={notif._id}
              className={`card flex items-start gap-4 animate-fade-in ${
                !notif.read ? 'border-primary-500/30 bg-primary-50/50 dark:border-primary-500/20 dark:bg-primary-950/20' : ''
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Unread indicator */}
              <div className="pt-1 flex-shrink-0">
                {!notif.read ? (
                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse-glow" />
                ) : (
                  <div className="w-2.5 h-2.5 bg-slate-300 rounded-full dark:bg-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 mb-1 dark:text-slate-300">{notif.message}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                  <span>From: {notif.sender?.name}</span>
                  <span>•</span>
                  <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                  {notif.item && (
                    <>
                      <span>•</span>
                      <Link
                        to={`/items/${notif.item._id}`}
                        className="text-primary-600 hover:text-primary-500 font-medium transition-colors dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        View Item
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => markRead(notif._id)}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-1 flex items-center gap-1 dark:text-slate-500 dark:hover:text-slate-300"
                  title="Mark as read"
                >
                  <Check className="w-3 h-3" /> Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
