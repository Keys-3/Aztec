import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onNavigate: (page: string) => void;
  initialMode?: 'login' | 'signup';
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    contact: '',
    role: 'customer' as 'customer' | 'farmer' | 'admin',
  });

  const { signIn, signUp } = useAuth();

  const resetForm = () => {
    setFormData({ email: '', password: '', username: '', contact: '', role: 'customer' });
    setMessage(null);
    setShowPassword(false);
    setRememberMe(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error, user } = await signIn(formData.email, formData.password, rememberMe);
        if (error) {
          setMessage({ type: 'error', text: error.message || 'Login failed. Please check your credentials.' });
        } else {
          setMessage({ type: 'success', text: 'Login successful!' });
          setTimeout(() => {
            if (user?.role === 'farmer' || user?.role === 'admin') {
              onNavigate('dashboard');
            } else {
              onNavigate('marketplace');
            }
          }, 1000);
        }
      } else {
        const { error, user } = await signUp(formData.email, formData.password, formData.username, formData.contact, formData.role, rememberMe);
        if (error) {
          setMessage({ type: 'error', text: error.message || 'Signup failed. Please try again.' });
        } else {
          setMessage({ type: 'success', text: 'Account created successfully!' });
          setTimeout(() => {
             if (formData.role === 'farmer' || formData.role === 'admin') {
               onNavigate('dashboard');
             } else {
               onNavigate('marketplace');
             }
          }, 1000);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center p-4 py-12 [perspective:2000px] overflow-hidden">
      
      {/* 3D Flip Container */}
      <div 
        className={`relative w-[600px] h-[600px] transition-transform duration-700 [transform-style:preserve-3d] ${mode === 'signup' ? '[transform:rotateY(180deg)]' : ''}`}
      >
        
        {/* ======================= */}
        {/*      LOGIN (FRONT)      */}
        {/* ======================= */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-emerald-100 flex flex-col items-center justify-center p-12">
          
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Welcome Back</h2>

          <div className="w-full max-w-sm">
            {message && mode === 'login' && (
              <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-login"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-login" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading && mode === 'login' ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?
                <button
                  onClick={switchMode}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                  type="button"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* ======================= */}
        {/*     SIGNUP (BACK)       */}
        {/* ======================= */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-emerald-100 flex flex-col items-center justify-center p-12">
          
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Create Account</h2>

          <div className="w-full max-w-sm">
            {message && mode === 'signup' && (
              <div className={`mb-3 p-3 rounded-lg flex items-center space-x-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                      placeholder="Phone"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Account Type</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm appearance-none"
                      required
                    >
                      <option value="customer">Customer</option>
                      <option value="farmer">Farmer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-signup"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-signup" className="ml-2 block text-xs text-gray-600">
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading && mode === 'signup' ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?
                <button
                  onClick={switchMode}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                  type="button"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AuthPage;