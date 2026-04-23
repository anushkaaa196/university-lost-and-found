import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import { Trash2, ArrowLeft, Hand } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [confirmClaim, setConfirmClaim] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    API.get(`/items/${id}`).then((res) => setItem(res.data)).catch(() => navigate('/dashboard')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await API.post(`/items/${id}/claim`);
      setItem(res.data);
      addToast('Item claimed! The reporter has been notified.', 'success');
      setConfirmClaim(false);
    } catch (err) { addToast(err.response?.data?.message || 'Failed to claim', 'error'); }
    finally { setClaiming(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this item?')) return;
    try {
      if (isAdmin) await API.delete(`/admin/items/${id}`);
      else await API.delete(`/items/${id}`);
      addToast('Item deleted', 'success');
      navigate(isAdmin ? '/admin' : '/my-items');
    } catch (err) { addToast(err.response?.data?.message || 'Failed to delete', 'error'); }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    try {
      const res = await API.put(`/admin/items/${id}/status`, { status: newStatus });
      setItem(res.data);
      addToast(`Status → "${newStatus}"`, 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Failed to change status', 'error'); }
    finally { setStatusChanging(false); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="card animate-pulse">
        <div className="-mx-6 -mt-6 mb-6"><div className="aspect-[16/9] bg-slate-100 rounded-t-2xl dark:bg-slate-700" /></div>
        <div className="h-6 bg-slate-100 rounded w-32 mb-6 dark:bg-slate-700" /><div className="h-8 bg-slate-100 rounded w-2/3 mb-4 dark:bg-slate-700" />
        <div className="h-4 bg-slate-100 rounded w-full mb-2 dark:bg-slate-700" /><div className="h-4 bg-slate-100 rounded w-3/4 mb-6 dark:bg-slate-700" />
        <div className="h-12 bg-slate-100 rounded w-40 dark:bg-slate-700" />
      </div>
    </div>
  );

  if (!item) return null;
  const isOwner = item.reportedBy?._id === user?.id;
  const hasImage = item.imageUrl && item.imageUrl.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 dark:text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-600 transition-colors dark:hover:text-slate-300">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300">{item.title}</span>
      </div>

      <div className="card overflow-hidden">
        {hasImage && (
          <div className="-mx-6 -mt-6 mb-6">
            <div className="aspect-[16/9] bg-slate-100 overflow-hidden dark:bg-slate-700">
              <img src={`${API_BASE}${item.imageUrl}`} alt={item.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>{item.type === 'lost' ? 'Lost' : 'Found'}</span>
          {item.status === 'claimed' && <span className="badge-claimed">Claimed</span>}
          {item.status === 'open' && <span className="badge-open">Still Lost</span>}
          {item.status === 'resolved' && <span className="badge-resolved">Resolved</span>}

          {isAdmin && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">Status:</span>
              <select value={item.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={statusChanging}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300" id="admin-status-select">
                <option value="open">Still Lost</option>
                <option value="claimed">Claimed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2 dark:text-white">{item.title}</h1>
        <p className="text-sm text-slate-400 mb-6 dark:text-slate-500">
          Reported by <span className="text-slate-600 font-medium dark:text-slate-300">{item.reportedBy?.name}</span> on{' '}
          {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <DetailCard label="Category" value={item.category} icon="🏷️" />
          <DetailCard label="Date" value={new Date(item.date).toLocaleDateString()} icon="📅" />
          <DetailCard label={item.type === 'lost' ? 'Last Seen At' : 'Found At'} value={item.location} icon="📍" />
          {item.heldAt && <DetailCard label="Currently Held At" value={item.heldAt} icon="🏢" />}
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 dark:text-slate-400">Description</h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap dark:text-slate-300">{item.description}</p>
        </div>

        {item.claimedBy && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-400"><span className="font-semibold">Claimed by:</span> {item.claimedBy.name} ({item.claimedBy.email})</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          {!isOwner && item.status === 'open' && (
            !confirmClaim ? (
              <button onClick={() => setConfirmClaim(true)} className="btn-success flex items-center gap-2" id="claim-button"><Hand className="w-4 h-4" /> Claim This Item</button>
            ) : (
              <div className="flex items-center gap-3 animate-slide-down">
                <span className="text-sm text-slate-500 dark:text-slate-400">Are you sure?</span>
                <button onClick={handleClaim} disabled={claiming} className="btn-success text-sm" id="confirm-claim-button">{claiming ? 'Claiming...' : 'Yes, Claim'}</button>
                <button onClick={() => setConfirmClaim(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            )
          )}
          {(isOwner || isAdmin) && <button onClick={handleDelete} className="btn-danger text-sm flex items-center gap-2" id="delete-button"><Trash2 className="w-4 h-4" /> Delete</button>}
          <Link to="/dashboard" className="btn-secondary text-sm flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</Link>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value, icon }) {
  return (
    <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 dark:text-slate-500"><span>{icon}</span>{label}</div>
      <p className="text-slate-700 font-medium dark:text-slate-200">{value}</p>
    </div>
  );
}
