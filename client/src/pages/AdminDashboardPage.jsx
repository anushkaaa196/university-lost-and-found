import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import { Shield, Eye, Trash2, Search } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function AdminDashboardPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('items');
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    API.get('/admin/stats').then((res) => setStats(res.data)).catch(() => addToast('Failed to load stats', 'error')).finally(() => setLoadingStats(false));
  }, [addToast]);

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await API.get('/admin/items', { params });
      setItems(res.data.items);
    } catch { addToast('Failed to load items', 'error'); }
    finally { setLoadingItems(false); }
  }, [typeFilter, statusFilter, searchQuery, addToast]);

  useEffect(() => { if (activeTab === 'items') fetchItems(); }, [activeTab, fetchItems]);
  useEffect(() => {
    if (activeTab === 'users') {
      setLoadingUsers(true);
      API.get('/admin/users').then((res) => setUsers(res.data)).catch(() => addToast('Failed to load users', 'error')).finally(() => setLoadingUsers(false));
    }
  }, [activeTab, addToast]);

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await API.put(`/admin/items/${itemId}/status`, { status: newStatus });
      setItems((prev) => prev.map((i) => (i._id === itemId ? res.data : i)));
      addToast(`Status → "${newStatus}"`, 'success');
      const s = await API.get('/admin/stats'); setStats(s.data);
    } catch (err) { addToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await API.delete(`/admin/items/${itemId}`);
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      addToast('Item deleted', 'success');
      const s = await API.get('/admin/stats'); setStats(s.data);
    } catch (err) { addToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleSearch = (e) => { e.preventDefault(); setSearchQuery(searchInput); };

  const statCards = stats ? [
    { label: 'Total Items', value: stats.totalItems, icon: '📦', color: 'from-primary-100 to-primary-50 dark:from-primary-950/40 dark:to-primary-950/20', text: 'text-primary-700 dark:text-primary-400' },
    { label: 'Open', value: stats.openItems, icon: '🔵', color: 'from-blue-100 to-blue-50 dark:from-blue-950/40 dark:to-blue-950/20', text: 'text-blue-700 dark:text-blue-400' },
    { label: 'Claimed', value: stats.claimedItems, icon: '🟡', color: 'from-amber-100 to-amber-50 dark:from-amber-950/40 dark:to-amber-950/20', text: 'text-amber-700 dark:text-amber-400' },
    { label: 'Resolved', value: stats.resolvedItems, icon: '✅', color: 'from-success-100 to-success-50 dark:from-emerald-950/40 dark:to-emerald-950/20', text: 'text-success-700 dark:text-emerald-400' },
    { label: 'Lost', value: stats.lostItems, icon: '🔴', color: 'from-red-100 to-red-50 dark:from-red-950/40 dark:to-red-950/20', text: 'text-red-600 dark:text-red-400' },
    { label: 'Found', value: stats.foundItems, icon: '🟢', color: 'from-accent-100 to-accent-50 dark:from-teal-950/40 dark:to-teal-950/20', text: 'text-accent-700 dark:text-teal-400' },
    { label: 'Users', value: stats.totalUsers, icon: '👥', color: 'from-purple-100 to-purple-50 dark:from-purple-950/40 dark:to-purple-950/20', text: 'text-purple-700 dark:text-purple-400' },
  ] : [];

  const statusColors = {
    open: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    claimed: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    resolved: 'bg-success-50 text-success-700 border-success-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-700 to-accent-600 flex items-center justify-center text-white text-xl shadow-lg shadow-primary-700/20 dark:from-primary-500 dark:to-accent-500">
          <Shield className="w-6 h-6" />
        </div>
        <div><h1 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Panel</h1><p className="text-slate-500 dark:text-slate-400">Manage items, users, and system status</p></div>
      </div>

      {/* Stats */}
      {loadingStats ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">{[...Array(7)].map((_, i) => <div key={i} className="card animate-pulse"><div className="h-8 bg-slate-100 rounded w-12 mb-2 dark:bg-slate-700" /><div className="h-3 bg-slate-100 rounded w-16 dark:bg-slate-700" /></div>)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <div key={stat.label} className={`rounded-2xl p-5 text-center bg-gradient-to-b ${stat.color} border border-white/50 shadow-sm animate-fade-in dark:border-slate-700/50`} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white border border-slate-200 rounded-xl p-1 mb-6 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <button onClick={() => setActiveTab('items')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'items' ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm dark:bg-primary-950/50 dark:text-primary-400 dark:border-primary-800' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`} id="admin-items-tab">📦 Items</button>
        <button onClick={() => setActiveTab('users')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'users' ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm dark:bg-primary-950/50 dark:text-primary-400 dark:border-primary-800' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`} id="admin-users-tab">👥 Users</button>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="animate-fade-in">
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search items..." className="input-field flex-1 pl-10" id="admin-search-input" />
                </div>
                <button type="submit" className="btn-primary text-sm" id="admin-search-button">Search</button>
              </form>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field sm:w-36"><option value="">All Types</option><option value="lost">Lost</option><option value="found">Found</option></select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-36"><option value="">All Status</option><option value="open">Open</option><option value="claimed">Claimed</option><option value="resolved">Resolved</option></select>
            </div>
          </div>

          {loadingItems ? (
            <div className="card animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4"><div className="w-10 h-10 bg-slate-100 rounded-lg dark:bg-slate-700" /><div className="flex-1"><div className="h-4 bg-slate-100 rounded w-48 mb-1 dark:bg-slate-700" /><div className="h-3 bg-slate-100 rounded w-32 dark:bg-slate-700" /></div></div>)}</div>
          ) : items.length === 0 ? (
            <div className="card text-center py-12"><div className="text-4xl mb-3">📭</div><p className="text-slate-500 dark:text-slate-400">No items found.</p></div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Item</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Type</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Category</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Reporter</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Date</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {items.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/60 transition-colors dark:hover:bg-slate-800/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700"><img src={`${API_BASE}${item.imageUrl}`} alt="" className="w-full h-full object-cover" /></div>
                            : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-sm flex-shrink-0 dark:bg-slate-700">📦</div>}
                            <Link to={`/items/${item._id}`} className="text-sm font-medium text-slate-700 hover:text-primary-700 transition-colors truncate max-w-[200px] dark:text-slate-200 dark:hover:text-primary-400">{item.title}</Link>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium ${item.type === 'lost' ? 'text-red-500 dark:text-red-400' : 'text-accent-600 dark:text-teal-400'}`}>{item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</span></td>
                        <td className="px-4 py-3"><span className="text-xs text-slate-500 dark:text-slate-400">{item.category}</span></td>
                        <td className="px-4 py-3"><div className="text-xs"><span className="text-slate-600 dark:text-slate-300">{item.reportedBy?.name}</span></div></td>
                        <td className="px-4 py-3">
                          <select value={item.status} onChange={(e) => handleStatusChange(item._id, e.target.value)}
                            className={`text-xs font-medium rounded-lg px-2.5 py-1.5 border cursor-pointer ${statusColors[item.status]} focus:outline-none`}>
                            <option value="open">Still Lost</option><option value="claimed">Claimed</option><option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs text-slate-400 dark:text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/items/${item._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all dark:hover:bg-primary-950/30 dark:hover:text-primary-400" title="View">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDeleteItem(item._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all dark:hover:bg-red-950/30 dark:hover:text-red-400" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          {loadingUsers ? (
            <div className="card animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4"><div className="w-10 h-10 bg-slate-100 rounded-full dark:bg-slate-700" /><div className="flex-1"><div className="h-4 bg-slate-100 rounded w-40 mb-1 dark:bg-slate-700" /><div className="h-3 bg-slate-100 rounded w-56 dark:bg-slate-700" /></div></div>)}</div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">User</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Email</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Student ID</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Role</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 dark:text-slate-400">Joined</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/60 transition-colors dark:hover:bg-slate-800/60">
                        <td className="px-4 py-3"><div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u.name?.charAt(0).toUpperCase()}</div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{u.name}</span>
                        </div></td>
                        <td className="px-4 py-3"><span className="text-sm text-slate-500 dark:text-slate-400">{u.email}</span></td>
                        <td className="px-4 py-3"><span className="text-sm text-slate-500 dark:text-slate-400">{u.studentId || '—'}</span></td>
                        <td className="px-4 py-3">{u.role === 'admin'
                          ? <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 border border-primary-200 dark:bg-primary-900/50 dark:text-primary-400 dark:border-primary-800">Admin</span>
                          : <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600">User</span>
                        }</td>
                        <td className="px-4 py-3"><span className="text-xs text-slate-400 dark:text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
