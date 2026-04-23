import { Link } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';

const categoryIcons = {
  Electronics: '💻', Stationery: '✏️', Keys: '🔑', Clothing: '👕',
  Books: '📚', 'ID/Cards': '💳', Accessories: '🎒', Bags: '👜',
  'Water Bottles': '🧴', Other: '📌',
};

const API_BASE = 'http://localhost:5000';

export default function ItemCard({ item }) {
  const timeAgo = getTimeAgo(item.createdAt);
  const hasImage = item.imageUrl && item.imageUrl.length > 0;

  return (
    <Link to={`/items/${item._id}`} className="card-hover block group overflow-hidden" id={`item-card-${item._id}`}>
      {/* Image with 16:9 aspect ratio */}
      <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden">
        <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-700">
          {hasImage ? (
            <img src={`${API_BASE}${item.imageUrl}`} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
              <span className="text-5xl opacity-40">{categoryIcons[item.category] || '📌'}</span>
            </div>
          )}
        </div>
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
            {item.type === 'lost' ? 'Lost' : 'Found'}
          </span>
          {item.status === 'claimed' && <span className="badge-claimed">Claimed</span>}
          {item.status === 'resolved' && <span className="badge-resolved">Resolved</span>}
        </div>
        <div className="absolute top-3 right-3 text-xs text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">{timeAgo}</div>
      </div>

      {/* Category + Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-primary-50 transition-colors dark:bg-slate-700 dark:group-hover:bg-primary-950/50">
          {categoryIcons[item.category] || '📌'}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800 truncate group-hover:text-primary-700 transition-colors dark:text-slate-200 dark:group-hover:text-primary-400">{item.title}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">{item.category}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 line-clamp-2 mb-3 dark:text-slate-400">{item.description}</p>

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {item.location}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(item.date).toLocaleDateString()}
        </span>
      </div>
      {item.reportedBy && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 dark:border-slate-700">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-[10px] text-white font-bold">
            {item.reportedBy.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">{item.reportedBy.name}</span>
        </div>
      )}
    </Link>
  );
}

function getTimeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}
