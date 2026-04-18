import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { parseTextInput, parseJsonInput } from '@/lib/engine';
import { capitalize } from '@/lib/utils';
import { SAMPLE_REVIEWS, SAMPLE_COMPETITOR_REVIEWS } from '@/lib/data';
import { Upload, Play, Trash2, Database, Filter, Brain, BarChart3, Target, Box, Users } from 'lucide-react';

const TABS = ['Text', 'JSON', 'Sample Data'] as const;
const PIPELINE_STEPS = [
  { label: 'Ingest', icon: Database },
  { label: 'Preprocess', icon: Filter },
  { label: 'NLP', icon: Brain },
  { label: 'Insights', icon: BarChart3 },
  { label: 'Decisions', icon: Target },
];

export default function Analyze() {
  const [tab, setTab] = useState<typeof TABS[number]>('Text');
  const [textInput, setTextInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const { isProcessing, pipelineStep, pipelineLabel, runPipeline, runSamplePipeline, runCompetitorPipeline, resetState, aiOutputs, processedReviews } = useAppStore();

  const handleAnalyze = async () => {
    if (isProcessing) return;
    if (tab === 'Text') {
      if (!textInput.trim()) return;
      await runPipeline(parseTextInput(textInput));
    } else if (tab === 'JSON') {
      if (!jsonInput.trim()) return;
      const reviews = parseJsonInput(jsonInput);
      if (reviews.length === 0) return;
      await runPipeline(reviews);
    } else {
      await runSamplePipeline();
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Analyze</h1>
      <p className="text-sm text-gray-500 mb-8">Input reviews and run the intelligence pipeline</p>

      <div className="grid grid-cols-12 gap-6">
        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="col-span-7 bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-gray-400" /> Input Reviews
          </h3>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold transition-all ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          {tab === 'Text' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Enter reviews (one per line)</label>
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder={"Battery drains too fast after the update.\nCamera quality is amazing in portrait mode.\nUI feels laggy and unresponsive."}
                className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>
          )}
          {tab === 'JSON' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Paste JSON array</label>
              <textarea
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                placeholder={'[{"text": "Battery is bad", "rating": 2, "source": "amazon"}]'}
                className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>
          )}
          {tab === 'Sample Data' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Load the Amazon Reviews 2023 dataset (Electronics) to test the full pipeline.</p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={runSamplePipeline}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amazon-yellow hover:bg-amazon-orange rounded-lg text-sm font-medium text-gray-900 transition disabled:opacity-50"
                >
                  <Database className="w-4 h-4" /> Analyze Amazon Reviews
                </motion.button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50"
            >
              <Play className="w-4 h-4" /> {isProcessing ? 'Processing...' : 'Run Analysis'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={resetState}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </motion.button>
          </div>

          {/* Quick Result Output */}
          {tab === 'Text' && !isProcessing && aiOutputs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-gray-100"
            >
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" /> NLP Output
              </h4>
              <div className="space-y-3">
                {aiOutputs.map((out, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                    <p className="font-medium text-gray-800 mb-2">"{processedReviews.find(r => r.review_id === out.review_id)?.original_text}"</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(out.aspect_sentiment).map(([aspect, sentiment]) => {
                        const prob = out.aspect_confidence?.[aspect] || 0.5;
                        const probPercent = Math.round(prob * 100);
                        return (
                          <span key={aspect} className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 ${
                            sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                            sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {capitalize(aspect)}: {capitalize(sentiment)}
                            <span className="opacity-75 text-[10px]">({probPercent}%)</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Pipeline Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="col-span-5 bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Brain className="w-4 h-4 text-gray-400" /> Pipeline Status
          </h3>

          <div className="space-y-4">
            {PIPELINE_STEPS.map((step, i) => {
              const isDone = pipelineStep > i;
              const isActive = pipelineStep === i;
              return (
                <div key={step.label} className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isDone ? '#16a34a' : isActive ? '#2563eb' : '#f3f4f6',
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  >
                    <step.icon className={`w-4 h-4 ${isDone || isActive ? 'text-white' : 'text-gray-400'}`} />
                  </motion.div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${isDone ? 'text-green-700' : isActive ? 'text-blue-700' : 'text-gray-400'}`}>
                      {step.label}
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                        className="h-0.5 bg-blue-400 rounded-full mt-1"
                      />
                    )}
                  </div>
                  {isDone && <span className="text-green-600 text-xs font-bold">✓</span>}
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <div className="text-xs font-mono text-gray-400">
              {pipelineLabel || 'Waiting for input...'}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
