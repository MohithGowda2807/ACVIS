import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<'user' | 'company'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) { setError('Passwords do not match'); return; }
    setLoading(true);

    try {
      await api.register(email, password, role);
      navigate('/login');
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
        className="w-full max-w-[350px] border border-gray-300 rounded-[8px] p-6 shadow-sm mb-4"
      >
        <h1 className="text-[28px] font-normal mb-4 font-['Amazon Ember',Arial,sans-serif]">Create account</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-500 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-[13px] font-bold mb-1">Email</label>
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
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-400 rounded focus:border-amazon-warning focus:ring-1 focus:ring-amazon-warning focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1"><i className="text-blue-600">i</i> Passwords must be at least 6 characters.</p>
          </div>

          <div className="mb-6">
            <label className="block text-[13px] font-bold mb-1">Re-enter password</label>
            <input
              type="password"
              required
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-400 rounded focus:border-amazon-warning focus:ring-1 focus:ring-amazon-warning focus:outline-none transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-[13px] font-bold mb-2">Account Type</label>
            <div className="flex gap-4">
              <label className="flex items-center text-[13px]">
                <input type="radio" checked={role === 'user'} onChange={() => setRole('user')} className="mr-2" /> Customer
              </label>
              <label className="flex items-center text-[13px]">
                <input type="radio" checked={role === 'company'} onChange={() => setRole('company')} className="mr-2" /> Company Analyst
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 bg-[#f0c14b] hover:bg-[#f4d078] border border-[#a88734] rounded shadow-sm text-sm mb-4 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </form>

        <p className="text-[12px] text-gray-800 leading-relaxed mb-6">
          By creating an account, you agree to ACVIS's <a href="#" className="text-amazon-link hover:underline hover:text-amazon-warning">Conditions of Use</a> and <a href="#" className="text-amazon-link hover:underline hover:text-amazon-warning">Privacy Notice</a>.
        </p>

        <div className="h-px bg-gray-200 w-full mb-4"></div>

        <p className="text-[13px]">
          Already have an account? <Link to="/login" className="text-amazon-link hover:underline hover:text-amazon-warning">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
