import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser, googleLogin } from '../api';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', secretKey: '' });
  const [showPass, setShowPass] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const res = await googleLogin({ email: userInfo.data.email, name: userInfo.data.name, role: 'student' });
        if (res.data.success) {
          login({ ...res.data.user, picture: userInfo.data.picture });
          toast.success(`Welcome, ${userInfo.data.name}!`);
          navigate('/book');
        } else {
          toast.error('Failed to sync with server');
        }
      } catch (err) {
        toast.error('Failed to authenticate with server');
      }
    },
    onError: () => toast.error('Google Sign-In failed'),
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Email and password required');
    setLoading(true);
    try {
      const res = await loginUser({ email: form.email, password: form.password, secretKey: form.secretKey });
      if (res.data.success) {
        login(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        navigate(res.data.user.role === 'admin' ? '/resources' : '/book');
      } else {
        toast.error(res.data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/60">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow mb-4">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">BookMyCampus</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email</label>
              <input name="email" type="email" className="input" placeholder="you@college.edu" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 mb-2">
              <input type="checkbox" id="isAdmin" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer" onChange={(e) => setShowAdminKey(e.target.checked)} />
              <label htmlFor="isAdmin" className="text-sm font-medium text-slate-700 cursor-pointer">Login as Administrator</label>
            </div>
            
            {showAdminKey && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden mt-4">
                <label className="input-label">Admin Secret Key</label>
                <div className="relative">
                  <input name="secretKey" type={showSecret ? 'text' : 'password'} className="input pr-10" placeholder="Enter admin secret key" value={form.secretKey} onChange={handleChange} required={showAdminKey} />
                  <button type="button" onClick={() => setShowSecret(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</span>
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">Or continue with</span></div>
          </div>

          <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          © 2025 BookMyCampus · Campus Resource Management
        </p>
      </motion.div>
    </div>
  );
}
