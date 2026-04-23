import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import { Upload, X, Plus, ImageIcon } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Stationery', 'Keys', 'Clothing', 'Books', 'ID/Cards', 'Accessories', 'Bags', 'Water Bottles', 'Other'];

export default function ReportItemPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [type, setType] = useState('lost');
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', heldAt: '', date: new Date().toISOString().split('T')[0] });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Please select a valid image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { addToast('Image must be under 5 MB', 'error'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleImageSelect(e.dataTransfer.files[0]); };
  const removeImage = () => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('type', type);
      formData.append('location', form.location);
      formData.append('date', form.date);
      if (type === 'found' && form.heldAt) formData.append('heldAt', form.heldAt);
      if (imageFile) formData.append('image', imageFile);
      await API.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast('Item reported successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report item');
      addToast('Failed to report item', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Report an Item</h1>
        <p className="text-slate-500 mt-1 dark:text-slate-400">Help the campus community by reporting a lost or found item</p>
      </div>

      {/* Type toggle */}
      <div className="flex bg-white border border-slate-200 rounded-xl p-1 mb-8 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <button type="button" onClick={() => setType('lost')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
            type === 'lost' ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`} id="type-lost-tab">
          🔴 I Lost Something
        </button>
        <button type="button" onClick={() => setType('found')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
            type === 'found' ? 'bg-accent-50 text-accent-700 border border-accent-200 shadow-sm dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`} id="type-found-tab">
          🟢 I Found Something
        </button>
      </div>

      <div className="card">
        {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-slide-down dark:bg-red-950/30 dark:border-red-800 dark:text-red-400" id="report-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Photo (optional)</label>
            {!imagePreview ? (
              <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-800/50'}`}>
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3 dark:text-slate-600" />
                <p className="text-sm text-slate-500 mb-1 dark:text-slate-400"><span className="text-primary-700 font-medium dark:text-primary-400">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">JPEG, PNG, WebP, GIF — max 5 MB</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageSelect(e.target.files[0])} className="hidden" id="report-image-input" />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
                <button type="button" onClick={removeImage} className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur rounded-lg text-slate-500 hover:text-red-500 hover:bg-white transition-all dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/80 backdrop-blur rounded-lg text-xs text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">{imageFile?.name}</div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Item Name</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="e.g., Silver MacBook Pro, Blue Backpack" required id="report-title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field resize-none h-28" placeholder="Describe the item in detail — brand, color, distinguishing features..." required id="report-description" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field" required id="report-category">
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="input-field" required id="report-date" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">{type === 'lost' ? 'Location Where Lost' : 'Location Where Found'}</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="e.g., Main Library, 2nd Floor" required id="report-location" />
          </div>
          {type === 'found' && (
            <div className="animate-slide-down">
              <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Currently Held At</label>
              <input type="text" name="heldAt" value={form.heldAt} onChange={handleChange} className="input-field" placeholder="e.g., Library Front Desk" id="report-held-at" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2" id="report-submit">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-5 h-5" />Submit Report</>}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
