import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { BUSINESS_CONFIG } from '@/lib/data';
import { Database, Activity } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const { processedReviews, aiOutputs, rawReviews, featureSentiment, backendConnected } = useAppStore();
  const cfg = BUSINESS_CONFIG;

  const settings = [
    { label: 'Total Users', value: `${(cfg.total_users / 1000000).toFixed(0)}M`, desc: 'Active user base for revenue calculations' },
    { label: 'ARPU Monthly', value: `${cfg.currency_symbol}${cfg.arpu_monthly}`, desc: 'Average revenue per user per month' },
    { label: 'Churn / Rating Drop', value: `${(cfg.churn_per_rating_drop * 100).toFixed(0)}%`, desc: 'Churn increase per 1-star rating drop' },
    { label: 'Spike Threshold', value: `${cfg.spike_threshold}x`, desc: 'Multiplier over 3-day average to trigger spike alert' },
    { label: 'Currency', value: `${cfg.currency_symbol} (${cfg.currency_suffix})`, desc: 'Display currency for financial projections' },
    { label: 'Pipeline Mode', value: backendConnected ? 'Backend NLP' : 'Client-side', desc: backendConnected ? 'NLP processed on server via Python engine' : 'NLP runs in-browser (keyword-based)' },
  ];

  const hasClientData = processedReviews.length > 0 && aiOutputs.length > 0;
  const hasBackendData = rawReviews.length > 0 && Object.keys(featureSentiment).length > 0;
  const hasData = hasClientData || hasBackendData;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Pipeline configuration and business parameters</p>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-3 gap-4 mb-8">
        {settings.map(s => (
          <motion.div key={s.label} variants={item} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-xl font-bold font-mono text-gray-900 mb-1">{s.value}</div>
            <div className="text-xs text-gray-400">{s.desc}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Data Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Database className="w-4 h-4 text-gray-400" /> Pipeline Data
        </h3>

        {!hasData ? (
          <p className="text-sm text-gray-400">No data yet. Run the pipeline from the Analyze page first.</p>
        ) : hasClientData ? (
          <div className="grid grid-cols-3 gap-4">
            {aiOutputs.slice(0, 12).map(o => {
              const proc = processedReviews.find(r => r.review_id === o.review_id);
              return (
                <motion.div key={o.review_id} whileHover={{ y: -2 }} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-700 mb-2 line-clamp-2">"{proc?.original_text}"</p>
                  <div className="flex items-center gap-2 mb-2">
                    {o.rating && <span className="text-xs text-yellow-500">{'★'.repeat(Math.round(o.rating))}</span>}
                    <span className="text-[10px] text-gray-400">{o.source}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(o.aspect_sentiment).map(([a, s]) => (
                      <span key={a} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        s === 'positive' ? 'bg-green-100 text-green-700' :
                        s === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{a}: {s}</span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
                <div className="text-2xl font-bold text-blue-700 font-mono">{rawReviews.length}</div>
                <div className="text-xs text-blue-500 mt-1">Reviews Processed</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-center">
                <div className="text-2xl font-bold text-emerald-700 font-mono">{Object.keys(featureSentiment).length}</div>
                <div className="text-xs text-emerald-500 mt-1">Features Tracked</div>
              </div>
              <div className="bg-violet-50 rounded-lg p-4 border border-violet-100 text-center">
                <div className="text-2xl font-bold text-violet-700 font-mono flex items-center justify-center gap-1">
                  <Activity className="w-4 h-4" /> Backend
                </div>
                <div className="text-xs text-violet-500 mt-1">Pipeline Source</div>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sample Reviews</h4>
            <div className="grid grid-cols-3 gap-4">
              {rawReviews.slice(0, 9).map((r, i) => (
                <motion.div key={r.review_id || i} whileHover={{ y: -2 }} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-700 mb-2 line-clamp-3">"{r.text}"</p>
                  <div className="flex items-center gap-2">
                    {r.rating && <span className="text-xs text-yellow-500">{'★'.repeat(Math.round(r.rating))}</span>}
                    <span className="text-[10px] text-gray-400">{r.source || 'amazon'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
