import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Plus, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function MyItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/items/my').then((res) => setItems(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statusColors = {
    open: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    claimed: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    resolved: 'bg-success-50 text-success-700 border-success-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-slate-800 dark:text-white">My Items</h1><p className="text-slate-500 mt-1 dark:text-slate-400">Items you've reported</p></div>
        <Link to="/report" className="btn-primary flex items-center gap-2" id="report-new-button">
          <Plus className="w-5 h-5" />
          Report New
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-slate-100 rounded-xl dark:bg-slate-700" /><div className="flex-1"><div className="h-4 bg-slate-100 rounded w-48 mb-2 dark:bg-slate-700" /><div className="h-3 bg-slate-100 rounded w-32 dark:bg-slate-700" /></div></div></div>)}</div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-slate-600 mb-2 dark:text-slate-300">No items reported yet</h3>
          <p className="text-slate-400 mb-6 dark:text-slate-500">Start by reporting a lost or found item.</p>
          <Link to="/report" className="btn-primary inline-flex items-center gap-2">Report an Item</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <Link to={`/items/${item._id}`} key={item._id} className="card-hover flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              {item.imageUrl ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700"><img src={`${API_BASE}${item.imageUrl}`} alt={item.title} className="w-full h-full object-cover" loading="lazy" /></div>
              ) : (
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${item.type === 'lost' ? 'bg-red-50 dark:bg-red-900/30' : 'bg-accent-50 dark:bg-teal-900/30'}`}>{item.type === 'lost' ? '🔴' : '🟢'}</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-700 truncate dark:text-slate-200">{item.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 dark:text-slate-500">
                  <span>{item.category}</span><span>•</span><span>{item.location}</span><span>•</span><span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`badge border ${statusColors[item.status]}`}>{item.status}</span>
              <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 dark:text-slate-600" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
