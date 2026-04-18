// ─── ACVIS Pipeline Engine ───
// Full TypeScript port of frontend/js/engine.js

import {
  ASPECT_ALIASES, POSITIVE_WORDS, NEGATIVE_WORDS,
  SARCASM_PATTERNS, EMOTION_KEYWORDS, ROOT_CAUSE_KEYWORDS,
  BUSINESS_CONFIG,
  type Review, type ProcessedReview, type AIOutput,
  type FeatureStats, type Alert, type Action, type TrendDay, type SpikeInfo, type Directive, type RiskItem
} from './data';
import { capitalize } from './utils';

// ─── 1. Ingestion ───
export function ingestReviews(reviews: Review[]): Review[] {
  const seen = new Set<string>();
  return reviews.filter(r => {
    if (!r.text || r.text.trim().length === 0) return false;
    const hash = r.text.trim().toLowerCase();
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  }).map((r, i) => ({
    review_id: r.review_id || `REV-${Date.now()}-${i + 1}`,
    text: r.text.trim(),
    rating: r.rating || null,
    timestamp: r.timestamp || new Date().toISOString(),
    source: r.source || 'unknown',
  }));
}

// ─── 2. Preprocessing ───
const CONTRACTIONS: Record<string, string> = {
  "can't": "cannot", "won't": "will not", "don't": "do not",
  "doesn't": "does not", "isn't": "is not", "aren't": "are not",
  "wasn't": "was not", "weren't": "were not", "haven't": "have not",
  "hasn't": "has not", "didn't": "did not", "couldn't": "could not",
  "shouldn't": "should not", "wouldn't": "would not", "i'm": "i am",
  "it's": "it is", "that's": "that is", "there's": "there is",
  "they're": "they are", "we're": "we are", "you're": "you are",
  "i've": "i have", "you've": "you have", "we've": "we have",
  "they've": "they have", "i'll": "i will", "you'll": "you will",
  "he'll": "he will", "she'll": "she will", "we'll": "we will",
  "they'll": "they will", "i'd": "i would", "you'd": "you would",
  "he'd": "he would", "she'd": "she would", "we'd": "we would",
  "they'd": "they would", "let's": "let us",
};

const SLANG_MAP: Record<string, string> = {
  'u': 'you', 'ur': 'your', 'r': 'are', 'pls': 'please',
  'plz': 'please', 'thx': 'thanks', 'ty': 'thank you',
  'tbh': 'to be honest', 'imo': 'in my opinion',
  'bc': 'because', 'w/': 'with', 'w/o': 'without',
  'gonna': 'going to', 'wanna': 'want to', 'gotta': 'got to',
  'kinda': 'kind of', 'sorta': 'sort of',
};

function cleanText(text: string): string {
  let t = text.toLowerCase();
  t = t.replace(/https?:\/\/\S+/gi, '');
  t = t.replace(/<[^>]*>/g, '');
  t = t.replace(/[^\w\s'.,!?-]/g, ' ');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function expandContractions(text: string): string {
  for (const [c, e] of Object.entries(CONTRACTIONS)) {
    text = text.replace(new RegExp(`\\b${c.replace("'", "'")}\\b`, 'gi'), e);
  }
  return text;
}

function mapSlang(text: string): string {
  const words = text.split(' ');
  return words.map(w => SLANG_MAP[w] || w).join(' ');
}

export function preprocessAll(rawReviews: Review[]): ProcessedReview[] {
  return rawReviews.map(r => {
    let t = cleanText(r.text);
    t = expandContractions(t);
    t = mapSlang(t);
    return {
      review_id: r.review_id,
      original_text: r.text,
      clean_text: t,
      rating: r.rating,
      timestamp: r.timestamp,
      source: r.source,
    };
  });
}

// ─── 3. NLP Analysis ───
function extractAspects(text: string): string[] {
  const found: Record<string, boolean> = {};
  for (const [aspect, keywords] of Object.entries(ASPECT_ALIASES)) {
    for (const kw of keywords) {
      if (text.includes(kw)) { found[aspect] = true; break; }
    }
  }
  if (Object.keys(found).length === 0) found['general'] = true;
  return Object.keys(found);
}

function scoreSentiment(text: string, rating: number | null = null): string {
  // 1. Rating Priority (Direct Signal)
  if (rating !== null) {
    if (rating >= 4) return 'positive';
    if (rating <= 2) return 'negative';
  }

  const textLower = text.toLowerCase();
  
  // 2. Strict Negative Keyword Overrides
  const negStrict = ['trash', 'garbage', 'worst', 'useless', 'scam', 'terrible', 'pathetic'];
  if (negStrict.some(w => textLower.includes(w))) return 'negative';

  // 3. Keyword Scoring with Punctuation Handling
  // Strip punctuation from words for dictionary matching
  const words = textLower.split(/\s+/).map(w => w.replace(/[.,!?-]/g, ''));
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.includes(w)) pos += 1.5;
    if (NEGATIVE_WORDS.includes(w)) neg += 1.5;
  }
  
  const isSarcastic = SARCASM_PATTERNS.some(p => p.test(textLower));
  if (isSarcastic) { [pos, neg] = [neg, pos]; }
  
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
}

function detectEmotion(text: string): string {
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (emotion === 'neutral') continue;
    for (const kw of keywords) {
      if (text.includes(kw)) return emotion;
    }
  }
  return 'neutral';
}

function extractKeywords(text: string): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 3);
  const stopwords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'their', 'will', 'would', 'could', 'should', 'about', 'after', 'before', 'very', 'really', 'much', 'some', 'also', 'just', 'than', 'then', 'when', 'what', 'which', 'where', 'there', 'here', 'your', 'more', 'most', 'does', 'doing', 'each', 'every']);
  const allKnown = new Set([...POSITIVE_WORDS, ...NEGATIVE_WORDS, ...Object.values(ASPECT_ALIASES).flat()]);
  return words.filter(w => !stopwords.has(w) && !allKnown.has(w)).slice(0, 5);
}

export function analyzeAll(processedReviews: ProcessedReview[]): AIOutput[] {
  return processedReviews.map(r => {
    const aspects = extractAspects(r.clean_text);
    const aspectSentiment: Record<string, string> = {};
    for (const a of aspects) { aspectSentiment[a] = scoreSentiment(r.clean_text, r.rating); }
    const emotion = detectEmotion(r.clean_text);
    const keywords = extractKeywords(r.clean_text);
    return {
      review_id: r.review_id,
      aspects,
      aspect_sentiment: aspectSentiment,
      aspect_confidence: {},
      emotion,
      keywords,
      rating: r.rating,
      timestamp: r.timestamp,
      source: r.source,
    };
  });
}

// ─── 4. Aggregation ───
export function aggregateFeatureSentiment(aiOutputs: AIOutput[]): Record<string, FeatureStats> {
  const fs: Record<string, { positive: number; negative: number; neutral: number; total: number }> = {};
  for (const out of aiOutputs) {
    for (const [aspect, sent] of Object.entries(out.aspect_sentiment)) {
      if (!fs[aspect]) fs[aspect] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      (fs[aspect] as any)[sent]++;
      fs[aspect].total++;
    }
  }
  for (const f of Object.keys(fs)) {
    const t = fs[f].total;
    fs[f].positive = fs[f].positive / t;
    fs[f].negative = fs[f].negative / t;
    fs[f].neutral = fs[f].neutral / t;
  }
  return fs;
}

export function aggregateTrends(aiOutputs: AIOutput[]): Record<string, Record<string, TrendDay>> {
  const trends: Record<string, Record<string, TrendDay>> = {};
  for (const out of aiOutputs) {
    const day = out.timestamp ? out.timestamp.split('T')[0] : 'unknown';
    for (const [asp, sent] of Object.entries(out.aspect_sentiment)) {
      if (!trends[asp]) trends[asp] = {};
      if (!trends[asp][day]) trends[asp][day] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      (trends[asp][day] as any)[sent]++;
      trends[asp][day].total++;
    }
  }
  return trends;
}

export function detectSpikes(trends: Record<string, Record<string, TrendDay>>): Record<string, SpikeInfo> {
  const cfg = BUSINESS_CONFIG;
  const trendAlerts: Record<string, SpikeInfo> = {};
  for (const [feature, days] of Object.entries(trends)) {
    const sortedDays = Object.keys(days).sort();
    if (sortedDays.length < 3) continue;
    for (let i = 2; i < sortedDays.length; i++) {
      const prevDays = sortedDays.slice(Math.max(0, i - 3), i);
      const avg = prevDays.reduce((s, d) => s + days[d].negative, 0) / prevDays.length;
      const current = days[sortedDays[i]].negative;
      if (avg > 0 && current >= avg * cfg.spike_threshold) {
        trendAlerts[feature] = { day: sortedDays[i], current, avg: avg.toFixed(1) };
      }
    }
  }
  return trendAlerts;
}

export function identifyRootCauses(aiOutputs: AIOutput[], processedReviews: ProcessedReview[]): Record<string, Record<string, number>> {
  const rootCauses: Record<string, Record<string, number>> = {};
  for (const out of aiOutputs) {
    for (const [asp, sent] of Object.entries(out.aspect_sentiment)) {
      if (sent !== 'negative') continue;
      const proc = processedReviews.find(r => r.review_id === out.review_id);
      if (!proc) continue;
      for (const kw of ROOT_CAUSE_KEYWORDS) {
        if (proc.clean_text.includes(kw)) {
          if (!rootCauses[asp]) rootCauses[asp] = {};
          rootCauses[asp][kw] = (rootCauses[asp][kw] || 0) + 1;
        }
      }
    }
  }
  return rootCauses;
}

export function aggregateEmotions(aiOutputs: AIOutput[]): Record<string, number> {
  const emotions: Record<string, number> = { anger: 0, frustration: 0, satisfaction: 0, neutral: 0 };
  for (const out of aiOutputs) {
    emotions[out.emotion] = (emotions[out.emotion] || 0) + 1;
  }
  return emotions;
}

export function computePredictions(aiOutputs: AIOutput[]) {
  const ratings = aiOutputs.filter(o => o.rating).map(o => o.rating!);
  if (ratings.length < 4) return { current: 0, predicted: 0, trend: 'stable' as const, slope: 0 };
  const mid = Math.floor(ratings.length / 2);
  const firstHalf = ratings.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const secondHalf = ratings.slice(mid).reduce((a, b) => a + b, 0) / (ratings.length - mid);
  const slope = parseFloat((secondHalf - firstHalf).toFixed(2));
  const current = parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1));
  const predicted = parseFloat(Math.max(1, Math.min(5, current + slope)).toFixed(1));
  const trend = slope < -0.2 ? 'declining' as const : slope > 0.2 ? 'improving' as const : 'stable' as const;
  return { current, predicted, trend, slope };
}

// ─── 5. Decision Engine ───
export function generateDecisions(
  featureSentiment: Record<string, FeatureStats>,
  trendAlerts: Record<string, SpikeInfo>,
  rootCauses: Record<string, Record<string, number>>,
  predictions: ReturnType<typeof computePredictions>
) {
  const actions: Action[] = [];
  const alerts: Alert[] = [];

  for (const [feature, stats] of Object.entries(featureSentiment)) {
    if (feature === 'general') continue;
    if (stats.negative > 0.6) {
      alerts.push({ priority: 'critical', feature, message: `${capitalize(feature)} has ${Math.round(stats.negative * 100)}% negative sentiment`, reason: `Exceeds 60% negative threshold across ${stats.total} reviews` });
      actions.push({ priority: 'critical', feature, action: `Immediately investigate and fix ${feature} issues`, reason: `Critical negative sentiment at ${Math.round(stats.negative * 100)}%` });
    }
    if (trendAlerts[feature]) {
      const spike = trendAlerts[feature];
      alerts.push({ priority: 'high', feature, message: `Complaint spike detected for ${capitalize(feature)}`, reason: `${spike.current} complaints on ${spike.day} (avg: ${spike.avg})` });
      actions.push({ priority: 'high', feature, action: `Investigate recent changes affecting ${feature}`, reason: `Spike: ${spike.current} complaints vs avg ${spike.avg}` });
    }
    if (rootCauses[feature]) {
      const causes = Object.entries(rootCauses[feature]).sort((a, b) => b[1] - a[1]);
      if (causes.length > 0) {
        actions.push({ priority: 'high', feature, action: `Review recent ${causes[0][0]} related to ${feature}`, reason: `${causes[0][1]} reviews mention "${causes[0][0]}" with negative ${feature} sentiment` });
      }
    }
    if (stats.negative > 0.3 && stats.negative <= 0.6) {
      actions.push({ priority: 'medium', feature, action: `Monitor ${feature} sentiment and plan improvements`, reason: `Moderate negative sentiment at ${Math.round(stats.negative * 100)}%` });
    }
    if (stats.positive > 0.7 && stats.total > 5) {
      actions.push({ priority: 'low', feature, action: `Leverage ${feature} as marketing strength`, reason: `High positive sentiment at ${Math.round(stats.positive * 100)}% across ${stats.total} reviews` });
    }
  }

  if (predictions.trend === 'declining') {
    alerts.push({ priority: 'high', feature: 'overall', message: 'Overall rating predicted to decline', reason: `Current ${predictions.current} -> Predicted ${predictions.predicted}` });
    actions.push({ priority: 'critical', feature: 'overall', action: 'Prioritize product stability and bug fixes', reason: `Rating decline from ${predictions.current} to ${predictions.predicted}` });
  }

  if (featureSentiment.support && featureSentiment.support.negative > 0.4) {
    actions.push({ priority: 'high', feature: 'support', action: 'Improve customer support response times', reason: `Support satisfaction is critically low at ${Math.round(featureSentiment.support.negative * 100)}% negative` });
  }

  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return { actions, alerts };
}

// ─── 6. Revenue Impact ───
export function calculateRevenueImpact(
  predictions: ReturnType<typeof computePredictions>,
  featureSentiment: Record<string, FeatureStats>,
  trendAlerts: Record<string, SpikeInfo>
) {
  const cfg = BUSINESS_CONFIG;
  const currentRating = predictions.current || 4.2;
  const predictedRating = predictions.predicted || currentRating;
  const ratingDelta = Math.max(0, currentRating - predictedRating);
  const churnIncrease = ratingDelta * cfg.churn_per_rating_drop;
  const totalMonthlyRevenue = cfg.total_users * cfg.arpu_monthly;
  const monthlyLoss = totalMonthlyRevenue * churnIncrease;

  let topLiability = '--';
  let maxNegImpact = -1;
  for (const [feature, stats] of Object.entries(featureSentiment)) {
    if (feature === 'general') continue;
    let impactScore = stats.negative * stats.total;
    if (trendAlerts[feature]) impactScore *= 1.5;
    if (impactScore > maxNegImpact) { maxNegImpact = impactScore; topLiability = feature; }
  }

  const liabilityExposure = monthlyLoss * (maxNegImpact > 0 ? 0.6 : 0);
  return {
    loss: monthlyLoss / cfg.currency_multiplier,
    churnIncrease: churnIncrease * 100,
    topLiability,
    exposure: liabilityExposure / cfg.currency_multiplier,
    recovery: monthlyLoss / cfg.currency_multiplier,
    currentRating,
    predictedRating,
  };
}

// ─── 7. Risk Velocity ───
export function calculateRiskVelocity(trends: Record<string, Record<string, TrendDay>>): RiskItem[] {
  const results: RiskItem[] = [];
  for (const [feature, days] of Object.entries(trends)) {
    const sortedDays = Object.keys(days).sort();
    if (sortedDays.length < 2) continue;
    const latestDay = sortedDays[sortedDays.length - 1];
    const prevDay = sortedDays[sortedDays.length - 2];
    const velocity = (days[latestDay].negative - days[prevDay].negative) / (days[prevDay].negative || 1);
    const recent = sortedDays.slice(-3);
    const totalNeg = recent.reduce((sum, d) => sum + days[d].negative, 0);
    results.push({ feature, velocity, volume: totalNeg });
  }
  return results;
}

// ─── 8. Autonomous Directives ───
export function generateAutonomousDirectives(
  revenueImpact: ReturnType<typeof calculateRevenueImpact>,
  riskData: RiskItem[],
  featureSentiment: Record<string, FeatureStats>
): Directive[] {
  const directives: Directive[] = [];
  if (revenueImpact.loss > 2.0 || riskData.some(r => r.feature === 'battery' && r.velocity > 0.4)) {
    directives.push({ type: 'CRITICAL', text: 'Rollback Update v2.1 Immediately', reason: `Detected catastrophic rating drop and ₹${revenueImpact.loss.toFixed(1)}Cr revenue risk linked to Battery regressions.` });
  }
  if (revenueImpact.predictedRating < 4.0) {
    directives.push({ type: 'ADVISORY', text: 'Pivot Engineering to Bug-Fix Sprint', reason: 'Predicted rating trend is declining. Reallocate 60% of feature capacity to stability.' });
  }
  const heroFeature = Object.entries(featureSentiment).find(([, s]) => s.positive > 0.8 && s.total > 10);
  if (heroFeature) {
    directives.push({ type: 'GROWTH', text: `Launch Campaign for ${capitalize(heroFeature[0])}`, reason: `Sentiment for ${heroFeature[0]} is at ${Math.round(heroFeature[1].positive * 100)}%. High leverage.` });
  }
  if (riskData.some(r => r.velocity > 0.5)) {
    directives.push({ type: 'ADVISORY', text: 'Freeze Secondary Feature Releases', reason: 'System instability detected in core modules.' });
  }
  return directives.length ? directives : [{ type: 'GROWTH', text: 'Maintain Current Roadmap', reason: 'System health is stable. All core metrics nominal.' }];
}

// ─── Helpers ───
export function parseTextInput(text: string): Review[] {
  return text.split('\n').filter(l => l.trim().length > 0).map((line, i) => ({
    review_id: `USR-${Date.now()}-${i + 1}`,
    text: line.trim(),
    rating: null,
    timestamp: new Date().toISOString(),
    source: 'user_input',
  }));
}

export function parseJsonInput(jsonText: string): Review[] {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data)) return data;
    if (data.reviews && Array.isArray(data.reviews)) return data.reviews;
    return [data];
  } catch { return []; }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ─── Full Pipeline Runner ───
export async function runFullPipeline(
  reviews: Review[],
  onStep?: (step: number, label: string) => void
) {
  onStep?.(0, 'Ingesting reviews...');
  await sleep(300);
  const rawReviews = ingestReviews(reviews);

  onStep?.(1, 'Preprocessing text...');
  await sleep(300);
  const processedReviews = preprocessAll(rawReviews);

  onStep?.(2, 'Running NLP analysis...');
  await sleep(500);
  const aiOutputs = analyzeAll(processedReviews);

  onStep?.(3, 'Generating insights...');
  await sleep(300);
  const featureSentiment = aggregateFeatureSentiment(aiOutputs);
  const trends = aggregateTrends(aiOutputs);
  const trendAlerts = detectSpikes(trends);
  const rootCauses = identifyRootCauses(aiOutputs, processedReviews);
  const emotions = aggregateEmotions(aiOutputs);
  const predictions = computePredictions(aiOutputs);

  onStep?.(4, 'Producing decisions...');
  await sleep(300);
  const { actions, alerts } = generateDecisions(featureSentiment, trendAlerts, rootCauses, predictions);
  const revenueImpact = calculateRevenueImpact(predictions, featureSentiment, trendAlerts);

  return {
    rawReviews, processedReviews, aiOutputs,
    featureSentiment, trends, trendAlerts, rootCauses,
    emotions, predictions, actions, alerts, revenueImpact
  };
}
