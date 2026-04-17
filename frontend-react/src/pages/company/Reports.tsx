import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { capitalize } from '@/lib/utils';
import { calculateRiskVelocity, generateAutonomousDirectives } from '@/lib/engine';
import { Brain, Star, Shield, Activity, Users, FileText } from 'lucide-react';

export default function Reports() {
  const { rawReviews, predictions, emotions, trends, revenueImpact, featureSentiment, companyStats, competitorStats } = useAppStore();

  if (rawReviews.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports</h1>
        <p className="text-sm text-gray-500 mb-8">AI directives, predictions, risk radar, and emotional analysis</p>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reports</h3>
          <p className="text-sm text-gray-500">Run analysis first</p>
        </div>
      </div>
    );
  }

  const riskData = calculateRiskVelocity(trends).filter(r => r.feature !== 'general').sort((a, b) => b.velocity - a.velocity).slice(0, 5);
  const directives = generateAutonomousDirectives(revenueImpact, riskData, featureSentiment);
  const emotionTotal = Object.values(emotions).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports</h1>
      <p className="text-sm text-gray-500 mb-8">AI directives, predictions, risk radar, and emotional analysis</p>

      {/* AI Directives + Predictions */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-gray-400" /> AI Product Manager
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
              Trust: {Math.min(98, 70 + Math.floor(rawReviews.length / 2))}%
            </span>
          </div>
          <div className="space-y-3">
            {directives.map((d, i) => (
              <div key={i} className={`p-4 rounded-lg border ${
                d.type === 'CRITICAL' ? 'bg-red-50 border-red-200' :
                d.type === 'ADVISORY' ? 'bg-amber-50 border-amber-200' :
                'bg-emerald-50 border-emerald-200'
              }`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  d.type === 'CRITICAL' ? 'text-red-600' :
                  d.type === 'ADVISORY' ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>{d.type} DIRECTIVE</div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{d.text}</p>
                <p className="text-xs text-gray-500">{d.reason}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-400" /> Predictions
          </h3>
          {predictions.current ? (
            <div className="text-center py-6">
              <div className="text-5xl font-extrabold font-mono text-gray-900">{predictions.current}</div>
              <div className="text-sm text-gray-500 mt-2 mb-4">Current Average Rating</div>
              <div className={`text-3xl font-bold ${
                predictions.trend === 'declining' ? 'text-red-600' :
                predictions.trend === 'improving' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {predictions.trend === 'declining' ? '↘' : '↗'} {predictions.predicted}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Predicted (2 weeks) · Trend: {capitalize(predictions.trend)} ({predictions.slope > 0 ? '+' : ''}{predictions.slope})
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Insufficient data</p>
          )}
        </motion.div>
      </div>

      {/* Risk Radar + Emotion Map */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" /> Risk Radar
          </h3>
          <div className="space-y-3">
            {riskData.map((r, i) => {
              let color = 'text-green-600 bg-green-100', status = 'Stable';
              if (r.velocity > 0.4) { color = 'text-red-600 bg-red-100'; status = 'Accelerating'; }
              else if (r.velocity > 0.1) { color = 'text-amber-600 bg-amber-100'; status = 'Emerging'; }
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">{capitalize(r.feature)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>{status}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" /> Emotion Map
          </h3>
          {emotionTotal > 0 ? (
            <div className="space-y-4">
              {Object.entries(emotions).sort((a, b) => b[1] - a[1]).map(([e, c]) => {
                const pct = Math.round((c / emotionTotal) * 100);
                const colorMap: Record<string, string> = {
                  anger: 'bg-red-500', frustration: 'bg-amber-500', satisfaction: 'bg-green-500', neutral: 'bg-gray-400'
                };
                return (
                  <div key={e} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-medium text-gray-600">{capitalize(e)}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`h-full rounded-full ${colorMap[e] || 'bg-gray-400'}`}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-400 w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No emotion data</p>
          )}
        </motion.div>
      </div>

      {/* Competitor Benchmark */}
      {companyStats && competitorStats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" /> Competitor Benchmark
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {['battery', 'camera', 'ui', 'performance'].map(f => {
              const you = companyStats[f] ? Math.round(companyStats[f].negative * 100) : 0;
              const comp = competitorStats[f] ? Math.round(competitorStats[f].negative * 100) : 0;
              return (
                <div key={f} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">{capitalize(f)}</span>
                    <span className={`text-xs font-bold ${you > comp ? 'text-red-600' : 'text-green-600'}`}>
                      {you}% vs {comp}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-600 w-10">YOU</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${you}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500 w-10">COMP</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-500 rounded-full" style={{ width: `${comp}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
