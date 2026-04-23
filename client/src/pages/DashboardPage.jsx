import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Stationery', 'Keys', 'Clothing', 'Books', 'ID/Cards', 'Accessories', 'Bags', 'Water Bottles', 'Other'];

export default function DashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ totalItems: 0, resolvedItems: 0, activeItems: 0 });

  // Fetch public stats for hero section
  useEffect(() => {
    axios.get('http://localhost:5000/api/stats/public')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await API.get('/items', { params });
      setItems(res.data.items);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter, statusFilter, searchQuery, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [typeFilter, categoryFilter, statusFilter, searchQuery]);

  const handleSearch = (e) => { e.preventDefault(); setSearchQuery(searchInput); };
  const handleHeroAction = (type) => {
    setTypeFilter(type);
    setCategoryFilter('');
    setStatusFilter('');
    setSearchQuery('');
    setSearchInput('');
    document.getElementById('items-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  const clearFilters = () => { setTypeFilter(''); setCategoryFilter(''); setStatusFilter(''); setSearchQuery(''); setSearchInput(''); };
  const hasFilters = typeFilter || categoryFilter || statusFilter || searchQuery;

  return (
    <div className="dark:bg-dark-surface min-h-screen">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden">
        {/* Mesh gradient base */}
        <div className="absolute inset-0 bg-mesh-gradient dark:bg-mesh-gradient-dark" />
        {/* Campus image overlay */}
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.04] dark:opacity-[0.06]" style={{ backgroundImage: "url('/campus-hero.png')" }} />
        {/* Additional decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent dark:from-dark-surface" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24">
          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-6 dark:bg-primary-950/40 dark:border-primary-800 dark:text-primary-400">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              Live on Campus — Real-time Updates
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight mb-6 dark:text-white">
              Lost Something?<br />
              <span className="bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-accent-400">UniFound</span> Has Your Back.
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed dark:text-slate-400">
              The smart lost & found portal for our campus. Report items, search the database, and get reunited with your belongings.
            </p>
          </div>

          {/* Glassmorphism Search Bar */}
          <div className="max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <form onSubmit={handleSearch} className="glass rounded-2xl p-2 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search lost & found items across campus..."
                  className="w-full bg-transparent border-0 pl-12 pr-4 py-3.5 text-slate-700 placeholder-slate-400 focus:outline-none text-base dark:text-slate-200 dark:placeholder-slate-500"
                  id="hero-search-input"
                />
              </div>
              <button type="submit" className="btn-primary rounded-xl px-8" id="hero-search-button">Search</button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button onClick={() => handleHeroAction('lost')} className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-red-200 hover:-translate-y-0.5 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-red-800" id="browse-lost-btn">
              <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform dark:bg-red-900/30">🔴</span>
              <div className="text-left">
                <p className="font-semibold text-slate-800 text-sm dark:text-slate-200">Browse Lost</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Items reported as lost</p>
              </div>
            </button>
            <button onClick={() => handleHeroAction('found')} className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-accent-200 hover:-translate-y-0.5 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-teal-800" id="browse-found-btn">
              <span className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform dark:bg-teal-900/30">🟢</span>
              <div className="text-left">
                <p className="font-semibold text-slate-800 text-sm dark:text-slate-200">Browse Found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Items waiting for owners</p>
              </div>
            </button>
            <Link to="/report" className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-700 to-accent-600 text-white shadow-lg shadow-primary-700/20 hover:shadow-primary-700/30 hover:-translate-y-0.5 transition-all duration-200 dark:from-primary-500 dark:to-accent-500" id="report-item-btn">
              <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">📝</span>
              <div className="text-left">
                <p className="font-semibold text-sm">Report an Item</p>
                <p className="text-xs text-white/70">Lost or found something</p>
              </div>
            </Link>
          </div>

          {/* Stats Cards — Glassmorphism */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl font-extrabold text-slate-800 animate-count-up dark:text-white">{stats.totalItems}</div>
              <p className="text-sm text-slate-500 mt-1 font-medium dark:text-slate-400">Items in Database</p>
              <div className="w-10 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full mx-auto mt-3" />
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl font-extrabold text-success-600 animate-count-up dark:text-success-400">{stats.resolvedItems}</div>
              <p className="text-sm text-slate-500 mt-1 font-medium dark:text-slate-400">Items Returned</p>
              <div className="w-10 h-1 bg-gradient-to-r from-success-500 to-success-600 rounded-full mx-auto mt-3" />
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl font-extrabold text-accent-600 animate-count-up dark:text-accent-400">{stats.activeItems}</div>
              <p className="text-sm text-slate-500 mt-1 font-medium dark:text-slate-400">Active Listings</p>
              <div className="w-10 h-1 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full mx-auto mt-3" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ ITEMS SECTION ============ */}
      <section id="items-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Recent Listings</h2>
            <p className="text-slate-500 mt-1 text-sm dark:text-slate-400">{total} item{total !== 1 ? 's' : ''} in total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name, description, or location..." className="input-field pl-10" id="search-input" />
              </div>
              <button type="submit" className="btn-primary" id="search-button">Search</button>
            </form>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field lg:w-40" id="type-filter">
              <option value="">All Types</option>
              <option value="lost">🔴 Lost</option>
              <option value="found">🟢 Found</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field lg:w-48" id="category-filter">
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field lg:w-40" id="status-filter">
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="claimed">Claimed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {hasFilters && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 dark:text-slate-500">Active:</span>
              {typeFilter && <span className="badge bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">Type: {typeFilter}<button onClick={() => setTypeFilter('')} className="ml-1.5 hover:text-slate-900 dark:hover:text-white">&times;</button></span>}
              {categoryFilter && <span className="badge bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">{categoryFilter}<button onClick={() => setCategoryFilter('')} className="ml-1.5 hover:text-slate-900 dark:hover:text-white">&times;</button></span>}
              {statusFilter && <span className="badge bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">Status: {statusFilter}<button onClick={() => setStatusFilter('')} className="ml-1.5 hover:text-slate-900 dark:hover:text-white">&times;</button></span>}
              {searchQuery && <span className="badge bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">"{searchQuery}"<button onClick={() => { setSearchQuery(''); setSearchInput(''); }} className="ml-1.5 hover:text-slate-900 dark:hover:text-white">&times;</button></span>}
              <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700 ml-2 font-medium dark:text-primary-400 dark:hover:text-primary-300">Clear all</button>
            </div>
          )}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="-mx-6 -mt-6 mb-4"><div className="aspect-[16/9] bg-slate-100 rounded-t-2xl dark:bg-slate-700" /></div>
                <div className="h-5 bg-slate-100 rounded w-20 mb-4 dark:bg-slate-700" />
                <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-slate-100 rounded-xl dark:bg-slate-700" /><div className="flex-1"><div className="h-4 bg-slate-100 rounded w-3/4 mb-2 dark:bg-slate-700" /><div className="h-3 bg-slate-100 rounded w-1/4 dark:bg-slate-700" /></div></div>
                <div className="h-3 bg-slate-100 rounded w-full mb-2 dark:bg-slate-700" /><div className="h-3 bg-slate-100 rounded w-2/3 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2 dark:text-slate-300">No items found</h3>
            <p className="text-slate-400 dark:text-slate-500">{hasFilters ? 'Try adjusting your filters.' : 'No items reported yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <div key={item._id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2">Previous</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/20 dark:bg-primary-500' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-700'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm px-4 py-2">Next</button>
          </div>
        )}
      </section>
    </div>
  );
}
