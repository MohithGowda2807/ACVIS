import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { capitalize } from '@/lib/utils';
import { TrendingUp, AlertTriangle, Inbox } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '@/lib/data';

export default function Trends() {
  const { trends, trendAlerts } = useAppStore();
  const features = Object.entries(trends).filter(([f]) => f !== 'general' && f !== 'price' && f !== 'support');

  if (features.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Trends & Spikes</h1>
        <p className="text-sm text-gray-500 mb-8">Negative sentiment over time with spike detection</p>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Trend Data</h3>
          <p className="text-sm text-gray-500">Run analysis first</p>
        </div>
      </div>
    );
  }

  // Build chart data
  const allDays = new Set<string>();
  features.forEach(([, days]) => Object.keys(days).forEach(d => allDays.add(d)));
  const sortedDays = [...allDays].sort();

  const chartData = sortedDays.map(day => {
    const point: Record<string, any> = { day: day.split('-').slice(1).join('/') };
    features.forEach(([f, days]) => {
      point[f] = days[day]?.negative || 0;
    });
    return point;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Trends & Spikes</h1>
      <p className="text-sm text-gray-500 mb-8">Negative sentiment over time with spike detection</p>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400" /> Complaint Trends
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {features.map(([f], i) => (
              <Line
                key={f}
                type="monotone"
                dataKey={f}
                name={capitalize(f)}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Spike Alerts */}
      {Object.keys(trendAlerts).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Detected Spikes
          </h3>
          <div className="space-y-3">
            {Object.entries(trendAlerts).map(([f, spike]) => (
              <div key={f} className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800">SPIKE</span>
                  <span className="text-sm font-medium text-gray-900">{capitalize(f)}: {spike.current} complaints</span>
                </div>
                <div className="text-xs text-gray-500">
                  {spike.day} · avg: {spike.avg}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
