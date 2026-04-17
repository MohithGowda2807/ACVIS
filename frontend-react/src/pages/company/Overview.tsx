import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { capitalize } from '@/lib/utils';
import { Database, BarChart3, AlertTriangle, Target, Star, Inbox, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Overview() {
  const { rawReviews, featureSentiment, alerts, actions, predictions, loadFromBackend } = useAppStore();
  const navigate = useNavigate();

  // Auto-load existing backend data on mount
  useEffect(() => {
    if (rawReviews.length === 0) {
      loadFromBackend();
    }
  }, []);
  const fEntries = Object.entries(featureSentiment)
    .filter(([f]) => f !== 'general')
    .sort((a, b) => b[1].negative - a[1].negative);

  if (rawReviews.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
        <p className="text-sm text-gray-500 mb-8">System health and key metrics at a glance</p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Yet</h3>
          <p className="text-sm text-gray-500 mb-6">Run your first analysis to see insights</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/company/analyze')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            Go to Analyze
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const kpis = [
    { label: 'Reviews', value: rawReviews.length, icon: Database, color: 'text-blue-600' },
    { label: 'Features', value: Object.keys(featureSentiment).length, icon: BarChart3, color: 'text-indigo-600' },
    { label: 'Alerts', value: alerts.length, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Actions', value: actions.length, icon: Target, color: 'text-emerald-600' },
    { label: 'Avg Rating', value: predictions.current || '—', icon: Star, color: 'text-yellow-500', trend: predictions.trend },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
      <p className="text-sm text-gray-500 mb-8">System health and key metrics at a glance</p>

      {/* KPI Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-5 gap-4 mb-8">
        {kpis.map(kpi => (
          <motion.div
            key={kpi.label}
            variants={item}
            whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-xl border border-gray-200 p-5 transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 font-mono">{kpi.value}</div>
            {kpi.trend && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                kpi.trend === 'declining' ? 'text-red-600' : kpi.trend === 'improving' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {kpi.trend === 'declining' ? <TrendingDown className="w-3 h-3" /> :
                 kpi.trend === 'improving' ? <TrendingUp className="w-3 h-3" /> :
                 <Minus className="w-3 h-3" />}
                {capitalize(kpi.trend)}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Feature Health + Alerts */}
      <div className="grid grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="col-span-7 bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" /> Feature Health
          </h3>
          <div className="space-y-3">
            {fEntries.slice(0, 8).map(([f, s]) => (
              <div key={f} className="flex items-center gap-3">
                <span className="w-24 text-xs font-semibold text-gray-600 truncate">{capitalize(f)}</span>
                <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden flex">
                  <div className="bg-green-500 h-full transition-all duration-700" style={{ width: `${Math.round(s.positive * 100)}%` }} />
                  <div className="bg-red-500 h-full transition-all duration-700" style={{ width: `${Math.round(s.negative * 100)}%` }} />
                  <div className="bg-gray-300 h-full transition-all duration-700" style={{ width: `${Math.round(s.neutral * 100)}%` }} />
                </div>
                <span className="text-[11px] font-mono text-gray-400 w-10 text-right">{Math.round(s.negative * 100)}%-</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="col-span-5 bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-400" /> Recent Alerts
          </h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-400">No alerts detected</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 4).map((a, i) => (
                <div key={i} className={`p-3 rounded-lg border-l-4 ${
                  a.priority === 'critical' ? 'border-l-red-500 bg-red-50' :
                  a.priority === 'high' ? 'border-l-amber-500 bg-amber-50' :
                  'border-l-gray-300 bg-gray-50'
                }`}>
                  <span className={`text-[10px] font-bold uppercase ${
                    a.priority === 'critical' ? 'text-red-700' : a.priority === 'high' ? 'text-amber-700' : 'text-gray-600'
                  }`}>{a.priority}</span>
                  <p className="text-xs text-gray-700 mt-1 font-medium">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
