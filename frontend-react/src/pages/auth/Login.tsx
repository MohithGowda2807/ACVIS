import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      const payloadBase64 = data.access_token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      setAuth(data.access_token, payload.sub, payload.role);
      navigate(payload.role === 'company' ? '/company' : '/user');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-6">
      <Link to="/" className="mb-6 mt-4">
        <span className="text-3xl font-bold tracking-tight">ACVIS</span><span className="text-amazon-orange text-3xl">.</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[350px] border border-gray-300 rounded-[8px] p-6 shadow-sm"
      >
        <h1 className="text-[28px] font-normal mb-4 font-['Amazon Ember',Arial,sans-serif]">Sign in</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-500 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-[13px] font-bold mb-1">Email or mobile phone number</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-400 rounded focus:border-amazon-warning focus:ring-1 focus:ring-amazon-warning focus:outline-none transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-bold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-400 rounded focus:border-amazon-warning focus:ring-1 focus:ring-amazon-warning focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 bg-[#f0c14b] hover:bg-[#f4d078] border border-[#a88734] rounded shadow-sm text-sm mb-4 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-[12px] text-gray-800 leading-relaxed mb-6">
          By continuing, you agree to ACVIS's <a href="#" className="text-amazon-link hover:underline hover:text-amazon-warning">Conditions of Use</a> and <a href="#" className="text-amazon-link hover:underline hover:text-amazon-warning">Privacy Notice</a>.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-[12px] text-gray-500">New to ACVIS?</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <Link to="/register" className="w-full block text-center py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded shadow-sm text-sm transition-colors">
          Create your ACVIS account
        </Link>
      </motion.div>
    </div>
  );
}
