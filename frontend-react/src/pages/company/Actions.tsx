import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { capitalize } from '@/lib/utils';
import { BUSINESS_CONFIG } from '@/lib/data';
import { Target, DollarSign, Users, AlertTriangle, TrendingUp, Compass, Inbox } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function Actions() {
  const { actions, revenueImpact: rev } = useAppStore();
  const cfg = BUSINESS_CONFIG;

  if (actions.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Action Console</h1>
        <p className="text-sm text-gray-500 mb-8">Prioritized recommendations and revenue impact</p>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Actions</h3>
          <p className="text-sm text-gray-500">Run analysis first</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Est. Revenue Risk', value: `${cfg.currency_symbol}${rev.loss.toFixed(2)} ${cfg.currency_suffix}`, icon: DollarSign, color: 'text-red-600', sub: `${rev.currentRating.toFixed(1)} → ${rev.predictedRating.toFixed(1)} rating` },
    { label: 'Churn Increase', value: `+${rev.churnIncrease.toFixed(1)}%`, icon: Users, color: 'text-amber-600' },
    { label: 'Top Liability', value: capitalize(rev.topLiability), icon: AlertTriangle, color: 'text-gray-900', sub: `${cfg.currency_symbol}${(rev.exposure || 0).toFixed(1)} ${cfg.currency_suffix} exposure` },
    { label: 'Recovery Potential', value: `${cfg.currency_symbol}${rev.recovery.toFixed(2)} ${cfg.currency_suffix}`, icon: TrendingUp, color: 'text-green-600' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Action Console</h1>
      <p className="text-sm text-gray-500 mb-8">Prioritized recommendations and revenue impact</p>

      {/* Revenue KPIs */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => (
          <motion.div key={kpi.label} variants={item} whileHover={{ y: -4 }} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <kpi.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
            {kpi.sub && <div className="text-xs text-gray-400 mt-1">{kpi.sub}</div>}
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Action Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-7 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-400" /> Action Items
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">{actions.length}</span>
          </div>
          <div className="space-y-3">
            {actions.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`p-4 rounded-lg border-l-4 bg-gray-50 ${
                  a.priority === 'critical' ? 'border-l-red-500' :
                  a.priority === 'high' ? 'border-l-amber-500' :
                  a.priority === 'medium' ? 'border-l-gray-400' :
                  'border-l-blue-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    a.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    a.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                    a.priority === 'medium' ? 'bg-gray-200 text-gray-600' :
                    'bg-blue-100 text-blue-700'
                  }`}>{a.priority}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">{a.action}</p>
                <p className="text-xs text-gray-500">{a.reason}</p>
                <p className="text-[10px] text-gray-400 mt-1">{capitalize(a.feature)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Execution Roadmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Compass className="w-4 h-4 text-gray-400" /> Execution Roadmap
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Within 24 Hours', color: 'border-red-500', textColor: 'text-red-600', items: actions.filter(a => a.priority === 'critical') },
                { label: 'Within 7 Days', color: 'border-amber-500', textColor: 'text-amber-600', items: actions.filter(a => a.priority === 'high') },
                { label: 'Within 30 Days', color: 'border-blue-500', textColor: 'text-blue-600', items: actions.filter(a => a.priority === 'medium' || a.priority === 'low') },
              ].map(phase => (
                <div key={phase.label} className="bg-gray-50 rounded-lg p-4">
                  <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${phase.textColor}`}>{phase.label}</div>
                  <div className="space-y-2">
                    {phase.items.length === 0 ? (
                      <p className="text-xs text-gray-400">No tasks</p>
                    ) : (
                      phase.items.map((a, i) => (
                        <div key={i} className={`pl-3 border-l-2 ${phase.color} text-xs text-gray-700`}>
                          {a.action}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
