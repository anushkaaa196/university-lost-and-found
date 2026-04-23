import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, AlertCircle } from 'lucide-react';

const NIET_REGEX = /^[a-zA-Z0-9._%+-]+@niet\.co\.in$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isEmailValid = NIET_REGEX.test(form.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isEmailValid) { setError('Please use a valid @niet.co.in email address'); return; }
    if (!form.studentId.trim()) { setError('Student ID is required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.studentId);
      addToast('Account created! Welcome to UniFound.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex dark:bg-dark-surface">
      {/* Left — University Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-accent-700 to-primary-900" />
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/campus-hero.png')" }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-xl border border-white/20">UF</div>
              <span className="text-2xl font-bold">UniFound</span>
            </div>
            <p className="text-accent-100 text-sm">University Lost & Found Portal</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Join the<br />Campus<br /><span className="text-primary-300">Community.</span>
            </h2>
            <p className="text-accent-100 text-lg max-w-md leading-relaxed">
              Create your account to report lost items, help fellow students, and keep our campus connected.
            </p>
            
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {['A','B','C','D','E'].map((l,i) => (
                  <div key={l} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white/30" style={{zIndex:5-i}}>
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-sm text-accent-100"><span className="font-semibold text-white">500+</span> students already using UniFound</p>
            </div>
          </div>

          <p className="text-accent-200 text-xs">© 2026 UniFound — NIET University Portal</p>
        </div>
      </div>

      {/* Right — Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface dark:bg-dark-surface relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-yellow-300 dark:hover:bg-slate-800 transition-all duration-200"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-700 to-accent-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-primary-700/20 mx-auto mb-3 dark:from-primary-500 dark:to-accent-500">UF</div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">UniFound</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create account</h2>
            <p className="text-slate-500 mt-1 dark:text-slate-400">Use your university email to get started</p>
          </div>

          <div className="card">
            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-slide-down dark:bg-red-950/30 dark:border-red-800 dark:text-red-400" id="register-error">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Jane Doe" required id="register-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">University Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => setEmailTouched(true)}
                  className={`input-field ${emailTouched && form.email && !isEmailValid ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600' : ''}`}
                  placeholder="you@niet.co.in"
                  required
                  id="register-email"
                />
                {emailTouched && form.email && !isEmailValid ? (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    Must be a valid @niet.co.in email
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">Must end with @niet.co.in</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Student ID</label>
                <input type="text" name="studentId" value={form.studentId} onChange={handleChange} className="input-field" placeholder="e.g., 0241CSIOT028" required id="register-student-id" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field" placeholder="6+ chars" required id="register-password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5 dark:text-slate-400">Confirm</label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field" placeholder="••••••" required id="register-confirm-password" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2" id="register-submit">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-700 hover:text-primary-600 font-medium transition-colors dark:text-primary-400 dark:hover:text-primary-300" id="login-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
