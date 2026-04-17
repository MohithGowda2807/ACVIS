import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { capitalize } from '@/lib/utils';
import { BarChart3, Inbox } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };
const COLORS = { positive: '#16a34a', negative: '#dc2626', neutral: '#9ca3af' };

export default function Features() {
  const { featureSentiment } = useAppStore();
  const entries = Object.entries(featureSentiment)
    .filter(([f]) => f !== 'general')
    .sort((a, b) => b[1].total - a[1].total);

  if (entries.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Feature Sentiment</h1>
        <p className="text-sm text-gray-500 mb-8">Per-feature sentiment breakdown</p>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data</h3>
          <p className="text-sm text-gray-500">Run analysis first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Feature Sentiment</h1>
      <p className="text-sm text-gray-500 mb-8">Per-feature sentiment breakdown across all analyzed reviews</p>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Feature</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Positive</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Negative</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Neutral</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Volume</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Distribution</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <motion.tbody variants={container} initial="hidden" animate="show">
            {entries.map(([f, s]) => (
              <motion.tr key={f} variants={item} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="px-6 py-3.5 text-sm font-semibold text-gray-900">{capitalize(f)}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-green-600">{Math.round(s.positive * 100)}%</td>
                <td className="px-4 py-3.5 text-sm font-medium text-red-600">{Math.round(s.negative * 100)}%</td>
                <td className="px-4 py-3.5 text-sm text-gray-500">{Math.round(s.neutral * 100)}%</td>
                <td className="px-4 py-3.5 text-sm font-mono text-gray-600">{s.total}</td>
                <td className="px-4 py-3.5">
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                    <div className="bg-green-500 h-full" style={{ width: `${Math.round(s.positive * 100)}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${Math.round(s.negative * 100)}%` }} />
                    <div className="bg-gray-300 h-full" style={{ width: `${Math.round(s.neutral * 100)}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  {s.negative > 0.6 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">CRITICAL</span>
                  ) : s.negative > 0.3 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">WATCH</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">HEALTHY</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </motion.div>

      {/* Donut Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-400" /> Donut Breakdown
        </h3>
        <div className="grid grid-cols-6 gap-4">
          {entries.slice(0, 6).map(([f, s]) => (
            <div key={f} className="text-center">
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Positive', value: Math.round(s.positive * 100) },
                      { name: 'Negative', value: Math.round(s.negative * 100) },
                      { name: 'Neutral', value: Math.round(s.neutral * 100) },
                    ]}
                    cx="50%" cy="50%" innerRadius={28} outerRadius={40}
                    paddingAngle={2} dataKey="value" strokeWidth={0}
                  >
                    <Cell fill={COLORS.positive} />
                    <Cell fill={COLORS.negative} />
                    <Cell fill={COLORS.neutral} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-xs font-semibold text-gray-700 mt-1">{capitalize(f)}</div>
              <div className="text-[10px] text-gray-400">{Math.round(s.negative * 100)}% neg</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
