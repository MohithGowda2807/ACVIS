import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { capitalize } from '@/lib/utils';
import { AlertTriangle, Check } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function Alerts() {
  const { alerts } = useAppStore();
  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all', label: `All (${alerts.length})` },
    { key: 'critical', label: `Critical (${alerts.filter(a => a.priority === 'critical').length})` },
    { key: 'high', label: `High (${alerts.filter(a => a.priority === 'high').length})` },
    { key: 'medium', label: `Medium (${alerts.filter(a => a.priority === 'medium').length})` },
  ];

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.priority === filter);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Alert Center</h1>
      <p className="text-sm text-gray-500 mb-8">{alerts.length} active alerts detected</p>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === f.key
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {alerts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">All Clear</h3>
          <p className="text-sm text-gray-500">No alerts detected</p>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {filtered.map((a, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ x: 4 }}
              className={`p-5 rounded-xl border-l-4 bg-white border border-gray-200 transition-shadow hover:shadow-md ${
                a.priority === 'critical' ? 'border-l-red-500' :
                a.priority === 'high' ? 'border-l-amber-500' :
                'border-l-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  a.priority === 'critical' ? 'bg-red-100 text-red-700' :
                  a.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{a.priority}</span>
                <span className="text-xs text-gray-400">{capitalize(a.feature)}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{a.message}</p>
              <p className="text-xs text-gray-500">{a.reason}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
