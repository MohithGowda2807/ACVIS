import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, AlertTriangle, Target, Shield, Zap,
  ArrowRight, BarChart3, MessageSquare, Sparkles, ChevronRight,
  Activity, Eye, Cpu, Globe, Star, Users, FileText, Search
} from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { start = end; clearInterval(timer); }
      setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  { icon: Brain, title: 'Feature-Level Sentiment', desc: 'Extract sentiment per product aspect — battery, camera, UI — not just overall ratings.', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { icon: TrendingUp, title: 'Trend & Spike Detection', desc: 'Real-time anomaly detection catches complaint surges before they become crises.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { icon: Eye, title: 'Predictive Forecasting', desc: 'Forecast rating drops weeks ahead using time-series analysis on sentiment data.', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { icon: Target, title: 'Action Recommendation', desc: 'AI-generated action items: "Push hotfix within 48 hours", "Notify users proactively".', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { icon: Shield, title: 'Fake Review Detection', desc: 'Identify spam reviews and bot patterns to keep your insights clean and reliable.', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { icon: Globe, title: 'Multilingual & Sarcasm', desc: 'Handles Hinglish, slang, and sarcasm — "Great, another crash 🙄" is correctly negative.', color: 'bg-pink-50 text-pink-700 border-pink-200' },
];

const PIPELINE_STEPS = [
  { icon: FileText, label: 'Upload Reviews', desc: 'CSV, JSON, or paste text', step: '1' },
  { icon: Cpu, label: 'NLP Processing', desc: 'Clean, normalize, translate', step: '2' },
  { icon: Brain, label: 'AI Analysis', desc: 'Sentiment, aspects, emotions', step: '3' },
  { icon: Zap, label: 'Actions Generated', desc: 'Alerts, fixes, predictions', step: '4' },
];

const STATS = [
  { value: 50000, suffix: '+', label: 'Reviews Analyzed' },
  { value: 15, suffix: '', label: 'Features Tracked' },
  { value: 97, suffix: '%', label: 'Accuracy Rate' },
  { value: 3, suffix: 's', label: 'Avg Pipeline Time' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#eaeded] flex flex-col font-sans">
      {/* ─── Amazon-Style Header ─── */}
      <header className="bg-[#131921] text-white">
        <div className="max-w-[1500px] mx-auto px-4 py-2.5 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 border border-transparent hover:border-white/40 p-1.5 rounded shrink-0">
            <Activity className="w-6 h-6 text-[#ff9900]" />
            <span className="text-xl font-bold tracking-tight">ACVIS</span>
            <span className="text-[10px] text-gray-400 mt-2">.com</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 flex h-10 rounded-md overflow-hidden max-w-3xl">
            <input
              type="text"
              readOnly
              className="flex-1 px-4 py-2 text-black text-sm focus:outline-none bg-white"
              placeholder="Analyze customer reviews with AI..."
            />
            <div className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center cursor-pointer transition-colors">
              <Search className="w-5 h-5 text-[#131921]" />
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/login" className="border border-transparent hover:border-white/40 px-3 py-1.5 rounded leading-tight">
              <div className="text-[11px] text-gray-300">Hello, sign in</div>
              <div className="text-sm font-bold">Account</div>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 text-sm font-bold bg-[#febd69] hover:bg-[#f3a847] text-[#131921] rounded-md transition-colors shadow-sm"
              >
                Get Started Free
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="bg-[#232f3e] px-4 py-1.5">
          <div className="max-w-[1500px] mx-auto flex items-center gap-6 text-sm text-gray-200">
            <a href="#features" className="hover:text-white transition-colors border border-transparent hover:border-white/30 px-2 py-1 rounded">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors border border-transparent hover:border-white/30 px-2 py-1 rounded">How It Works</a>
            <a href="#stats" className="hover:text-white transition-colors border border-transparent hover:border-white/30 px-2 py-1 rounded">Results</a>
            <span className="text-[#ff9900] font-bold border border-transparent hover:border-white/30 px-2 py-1 rounded cursor-pointer">
              Company Portal →
            </span>
          </div>
        </div>
      </header>

      {/* ─── Hero Banner ─── */}
      <section className="bg-gradient-to-b from-[#232f3e] to-[#37475a] px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[1500px] mx-auto"
        >
          <div className="bg-white rounded-lg shadow-amazon-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            {/* Left: Text */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Autonomous Customer Voice Intelligence
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f1111] leading-tight mb-4">
                Transform <span className="text-[#ff9900]">Customer Reviews</span> Into Business Action
              </h1>
              <p className="text-base text-gray-600 leading-relaxed mb-6 max-w-xl">
                ACVIS analyzes thousands of reviews in seconds — extracting feature-level sentiment,
                detecting complaint spikes, and generating actionable decisions automatically.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 bg-gradient-to-b from-[#f7ca72] to-[#f0c14b] hover:from-[#f0c14b] hover:to-[#e8b832] text-[#0f1111] text-sm font-bold rounded-lg border border-[#a88734] shadow-sm flex items-center gap-2 transition-all"
                  >
                    Start Analyzing <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 shadow-sm transition-all"
                  >
                    Sign In to Dashboard
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Right: Live Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="w-full md:w-[400px] shrink-0"
            >
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-amazon">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-[#ff9900]" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Live Analysis Preview</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Battery', neg: 72, color: 'bg-red-500' },
                    { label: 'Camera', neg: 12, color: 'bg-green-500' },
                    { label: 'UI', neg: 35, color: 'bg-yellow-500' },
                    { label: 'Performance', neg: 28, color: 'bg-green-500' },
                  ].map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                    >
                      <div className="text-xs text-gray-500 mb-1 font-medium">{f.label}</div>
                      <div className={`text-lg font-bold ${f.neg > 50 ? 'text-red-600' : f.neg > 30 ? 'text-amber-600' : 'text-green-600'}`}>
                        {f.neg}% neg
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${f.neg}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                          className={`h-full rounded-full ${f.color}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[11px] text-red-600 font-bold">SPIKE: Battery complaints ↑ 3.2x</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── Feature Cards Grid ─── */}
      <section id="features" className="px-4 py-12">
        <div className="max-w-[1500px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#0f1111] mb-2">
              Intelligence, Not Just Analytics
            </h2>
            <p className="text-sm text-gray-600">From raw reviews to boardroom-ready decisions — fully autonomous.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                className="bg-white rounded-lg border border-gray-200 p-5 shadow-amazon transition-all duration-200 cursor-default"
              >
                <div className={`w-10 h-10 rounded-lg ${f.color} border flex items-center justify-center mb-3`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0f1111] mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="px-4 py-12 bg-white border-t border-b border-gray-200">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#0f1111] mb-2">
              How It <span className="text-[#ff9900]">Works</span>
            </h2>
            <p className="text-sm text-gray-600">Four stages. Fully automated. Sub-second latency.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4">
            {PIPELINE_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative flex flex-col items-center text-center bg-gray-50 rounded-lg border border-gray-200 p-5"
              >
                <div className="w-8 h-8 rounded-full bg-[#ff9900] text-white text-sm font-bold flex items-center justify-center mb-3">
                  {step.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-[#0f1111] text-sm mb-1">{step.label}</h4>
                <p className="text-xs text-gray-500">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-gray-300">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section id="stats" className="px-4 py-12">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map(s => (
              <motion.div
                key={s.label}
                variants={item}
                whileHover={{ y: -4 }}
                className="text-center p-6 rounded-lg bg-white border border-gray-200 shadow-amazon transition-all"
              >
                <div className="text-3xl font-bold text-[#0f1111] mb-1 font-mono">
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 py-12 bg-white border-t border-gray-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-[800px] mx-auto text-center p-10 rounded-lg bg-gradient-to-b from-[#232f3e] to-[#131921] shadow-lg"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Listen to Your Customers?</h2>
          <p className="text-gray-300 text-sm mb-6">Start analyzing reviews in under 60 seconds. No credit card required.</p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-8 py-3 bg-gradient-to-b from-[#f7ca72] to-[#f0c14b] hover:from-[#f0c14b] hover:to-[#e8b832] text-[#0f1111] font-bold text-sm rounded-lg border border-[#a88734] shadow-sm flex items-center gap-2 mx-auto transition-all"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#232f3e] text-white text-center py-8 px-4">
        <div className="max-w-[1500px] mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#ff9900]" />
            <span className="font-bold text-lg">ACVIS</span>
          </div>
          <p className="text-xs text-gray-400">© 2026, ACVIS — Autonomous Customer Voice Intelligence System</p>
        </div>
      </footer>
    </div>
  );
}
