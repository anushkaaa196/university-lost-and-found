import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dark:bg-dark-surface">
      {/* Left — University Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Mesh gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950" />
        {/* Campus image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/campus-hero.png')" }}
        />
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-xl border border-white/20">
                UF
              </div>
              <span className="text-2xl font-bold">UniFound</span>
            </div>
            <p className="text-primary-200 text-sm">University Lost & Found Portal</p>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Never Lose<br />
                What Matters<br />
                <span className="text-accent-300">on Campus.</span>
              </h2>
              <p className="text-primary-200 text-lg max-w-md leading-relaxed">
                Report lost items, find what others have found, and reconnect with your belongings — all in one place.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl mb-2">🔍</div>
                <p className="text-sm font-medium">Smart Search</p>
                <p className="text-xs text-primary-300 mt-1">Find items instantly</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl mb-2">📸</div>
                <p className="text-sm font-medium">Photo Upload</p>
                <p className="text-xs text-primary-300 mt-1">Visual identification</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl mb-2">🔔</div>
                <p className="text-sm font-medium">Instant Alerts</p>
                <p className="text-xs text-primary-300 mt-1">Real-time notifications</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl mb-2">🛡️</div>
                <p className="text-sm font-medium">Secure</p>
                <p className="text-xs text-primary-300 mt-1">JWT encrypted auth</p>
              </div>
            </div>
          </div>

          <p className="text-primary-300 text-xs">© 2026 UniFound — NIET University Portal</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface dark:bg-dark-surface relative">
        {/* Theme toggle for login page */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-yellow-300 dark:hover:bg-slate-800 transition-all duration-200"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-700 to-accent-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-primary-700/20 mx-auto mb-3 dark:from-primary-500 dark:to-accent-500">
              UF
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">UniFound</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome back</h2>
            <p className="text-slate-500 mt-1 dark:text-slate-400">Sign in to your university account</p>
          </div>

          <div className="card">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-slide-down dark:bg-red-950/30 dark:border-red-800 dark:text-red-400" id="login-error">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">University Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@niet.co.in" required id="login-email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field" placeholder="••••••••" required id="login-password" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2" id="login-submit">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
              </button>
            </form>

            {/* Quick access hint */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Demo access:</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5 dark:text-slate-500">Admin: 0241csiot028@niet.co.in / admin123</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Student: student@niet.co.in / student123</p>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-700 hover:text-primary-600 font-medium transition-colors dark:text-primary-400 dark:hover:text-primary-300" id="register-link">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
