import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { Search, Play, LogOut, User, ChevronDown, Activity } from 'lucide-react';
import Chatbot from '@/components/Chatbot';

export default function AppLayout() {
  const portal = useAppStore(s => s.portal);
  const setPortal = useAppStore(s => s.setPortal);
  const resetState = useAppStore(s => s.resetState);
  const alerts = useAppStore(s => s.alerts);
  const { email, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    resetState();
    navigate('/');
  };

  const switchPortal = () => {
    const next = portal === 'company' ? 'user' : 'company';
    setPortal(next);
    navigate(next === 'company' ? '/company' : '/user');
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-amazon-lightBg flex flex-col font-amazon">
      {/* ─── Header ─── */}
      <header className="bg-amazon-dark text-white text-sm">
        <div className="flex items-center px-4 py-2 gap-4">

          {/* Logo */}
          <NavLink to={role === 'company' ? '/company' : '/user'} className="flex items-center gap-1 border border-transparent hover:border-white p-1 rounded shrink-0">
            <Activity className="w-5 h-5 text-amazon-orange" />
            <span className="text-2xl font-bold tracking-tighter">ACVIS</span>
          </NavLink>

          {/* Search Bar */}
          <div className="flex-1 flex h-10 rounded overflow-hidden shadow max-w-3xl">
            <input
              type="text"
              className="flex-1 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              placeholder="Search features, sentiment, products..."
            />
            <button className="bg-amazon-orange hover:bg-amazon-orangeHover px-4 py-2 flex items-center justify-center transition-colors">
              <Search className="w-5 h-5 text-amazon-dark" />
            </button>
          </div>

          {/* Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="cursor-pointer border border-transparent hover:border-white p-1.5 rounded leading-tight select-none"
            >
              <div className="text-[11px] text-gray-300">
                Hello, {email ? email.split('@')[0] : 'User'}
              </div>
              <div className="font-bold flex items-center gap-1">
                {portal === 'company' ? 'Vendor Central' : 'Account'}
                <ChevronDown className="w-3 h-3 mt-0.5" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white text-[#0f1111] rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#232f3e] flex items-center justify-center text-white font-bold text-sm">
                      {email ? email.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-bold truncate max-w-[180px]">{email || 'User'}</div>
                      <div className="text-[11px] text-gray-500 capitalize">{role} Account</div>
                    </div>
                  </div>
                </div>

                {/* Portal Switch */}
                {role === 'company' && (
                  <button
                    onClick={switchPortal}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    Switch to {portal === 'company' ? 'Customer' : 'Vendor'} View
                  </button>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 font-medium transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Sub-nav ─── */}
        <div className="bg-amazon-nav px-4 py-1.5 flex items-center gap-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {portal === 'company' ? (
            <>
              <NavLink to="/company" end className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Overview</NavLink>
              <NavLink to="/company/analyze" className={({isActive}) => `flex items-center gap-1 cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}><Play className="w-3 h-3"/> Analyze Data</NavLink>
              <NavLink to="/company/features" className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Feature Health</NavLink>
              <NavLink to="/company/trends" className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Trends & Spikes</NavLink>
              <NavLink to="/company/alerts" className={({isActive}) => `flex items-center gap-1 cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold text-amazon-orange':''}`}>
                {alerts.length > 0 && <span className="bg-red-600 text-white text-[10px] px-1 rounded mr-1">{alerts.length}</span>}
                Alerts
              </NavLink>
              <NavLink to="/company/actions" className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Action Items</NavLink>
              <NavLink to="/company/tickets" className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Support Tickets</NavLink>
              <NavLink to="/company/reports" className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>AI Reports</NavLink>
              <NavLink to="/company/settings" className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Settings</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/user/insights" className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Product Insights</NavLink>
              <NavLink to="/user" end className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Write a Review</NavLink>
              <NavLink to="/user/my-reviews" className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Your Reviews</NavLink>
              <NavLink to="/user/support" className={({isActive}) => `cursor-pointer border border-transparent hover:border-white px-2 py-1 rounded ${isActive?'font-bold':''}`}>Help & Support</NavLink>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1500px] mx-auto w-full px-4 py-4 md:py-6 relative z-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-amazon-nav text-white text-center py-6 text-sm mt-8">
        <p className="text-gray-400">© 2026, ACVIS — Autonomous Customer Voice Intelligence System</p>
      </footer>
      
      {/* Chatbot Widget */}
      <Chatbot />
    </div>
  );
}
