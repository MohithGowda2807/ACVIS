import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { BUSINESS_CONFIG } from '@/lib/data';
import { Settings as SettingsIcon, Database } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const { processedReviews, aiOutputs } = useAppStore();
  const cfg = BUSINESS_CONFIG;

  const settings = [
    { label: 'Total Users', value: `${(cfg.total_users / 1000000).toFixed(0)}M`, desc: 'Active user base for revenue calculations' },
    { label: 'ARPU Monthly', value: `${cfg.currency_symbol}${cfg.arpu_monthly}`, desc: 'Average revenue per user per month' },
    { label: 'Churn / Rating Drop', value: `${(cfg.churn_per_rating_drop * 100).toFixed(0)}%`, desc: 'Churn increase per 1-star rating drop' },
    { label: 'Spike Threshold', value: `${cfg.spike_threshold}x`, desc: 'Multiplier over 3-day average to trigger spike alert' },
    { label: 'Currency', value: `${cfg.currency_symbol} (${cfg.currency_suffix})`, desc: 'Display currency for financial projections' },
    { label: 'Pipeline Mode', value: 'Client', desc: 'NLP runs in-browser (keyword-based)' },
  ];

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

      {/* Processed Reviews */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Database className="w-4 h-4 text-gray-400" /> Processed Reviews
        </h3>
        {processedReviews.length === 0 ? (
          <p className="text-sm text-gray-400">No processed reviews</p>
        ) : (
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
        )}
      </motion.div>
    </div>
  );
}
