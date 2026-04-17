// ============================================================
// ACVIS — Core Application Engine
// Pipeline: Ingest → Preprocess → NLP → Insights → Decisions
// ============================================================

import {
  KNOWN_ASPECTS, ASPECT_ALIASES, POSITIVE_WORDS, NEGATIVE_WORDS,
  SARCASM_PATTERNS, CONTRACTIONS, SLANG_MAP, EMOTION_KEYWORDS,
  ROOT_CAUSE_KEYWORDS, THRESHOLDS, SAMPLE_REVIEWS, BUSINESS_CONFIG,
  FEATURE_ICONS, PRIORITY_CONFIG
} from './data.js';

// ─── State ───
let appState = {
  rawReviews: [],
  processedReviews: [],
  aiOutputs: [],
  featureSentiment: {},
  trends: {},
  trendAlerts: {},
  rootCauses: {},
  emotions: {},
  actions: [],
  alerts: [],
  predictions: {},
  revenueImpact: {
    loss: 0,
    churnIncrease: 0,
    topLiability: "--",
    recovery: 0,
    currentRating: 0,
    predictedRating: 0
  },
  isProcessing: false
};

// ============================================================
// 1. DATA INGESTION
// ============================================================
function ingestReviews(reviews) {
  const ingested = [];
  let idCounter = 1;
  for (const r of reviews) {
    const doc = { ...r };
    if (!doc.review_id) doc.review_id = `R-${Date.now()}-${idCounter++}`;
    if (!doc.timestamp) doc.timestamp = new Date().toISOString();
    if (!doc.source) doc.source = "unknown";
    if (!doc.rating) doc.rating = null;
    if (!doc.text || doc.text.trim().length < 3) continue; // skip empty/short
    ingested.push(doc);
  }
  // Deduplicate by text hash
  const seen = new Set();
  return ingested.filter(r => {
    const hash = simpleHash(r.text.toLowerCase().trim());
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

// ============================================================
// 2. PREPROCESSING
// ============================================================
function preprocessReview(review) {
  let text = review.text;

  // Step 1: Lowercase
  text = text.toLowerCase();

  // Step 2: Remove URLs
  text = text.replace(/https?:\/\/\S+/gi, '');
  text = text.replace(/www\.\S+/gi, '');

  // Step 3: Expand contractions
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    text = text.replace(new RegExp(contraction.replace("'", "'"), 'gi'), expansion);
  }

  // Step 4: Expand slang
  const words = text.split(/\s+/);
  const expanded = words.map(w => SLANG_MAP[w.toLowerCase()] || w);
  text = expanded.join(' ');

  // Step 5: Clean special chars but keep meaningful punctuation
  text = text.replace(/[^a-zA-Z0-9\s.,!?'-]/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return {
    review_id: review.review_id,
    original_text: review.text,
    clean_text: text,
    rating: review.rating,
    timestamp: review.timestamp,
    source: review.source,
    language: "en"
  };
}

function preprocessAll(reviews) {
  return reviews.map(preprocessReview);
}

// ============================================================
// 3. NLP ENGINE (Simulated — keyword / rule-based)
// ============================================================
function extractAspects(text) {
  const found = new Set();
  const lower = text.toLowerCase();

  // Check multi-word aliases first
  const sortedAliases = Object.entries(ASPECT_ALIASES)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [alias, aspect] of sortedAliases) {
    if (lower.includes(alias)) {
      found.add(aspect);
    }
  }

  // Check known aspects
  for (const aspect of KNOWN_ASPECTS) {
    if (lower.includes(aspect)) {
      found.add(aspect);
    }
  }

  // If nothing found, assign "general"
  if (found.size === 0) found.add("general");

  return [...found].slice(0, 5); // max 5 aspects
}

function analyzeSentimentForAspect(text, aspect) {
  const lower = text.toLowerCase();

  // Find words near the aspect mention
  const contextWindow = 60;
  const aspectIdx = lower.indexOf(aspect);
  let context = lower;
  if (aspectIdx !== -1) {
    const start = Math.max(0, aspectIdx - contextWindow);
    const end = Math.min(lower.length, aspectIdx + aspect.length + contextWindow);
    context = lower.substring(start, end);
  }

  // Also check aliases
  for (const [alias, mapped] of Object.entries(ASPECT_ALIASES)) {
    if (mapped === aspect && lower.includes(alias)) {
      const aIdx = lower.indexOf(alias);
      const s = Math.max(0, aIdx - contextWindow);
      const e = Math.min(lower.length, aIdx + alias.length + contextWindow);
      context += ' ' + lower.substring(s, e);
    }
  }

  let posScore = 0, negScore = 0;

  for (const w of POSITIVE_WORDS) {
    if (context.includes(w)) posScore++;
  }
  for (const w of NEGATIVE_WORDS) {
    if (context.includes(w)) negScore++;
  }

  // Check sarcasm
  for (const { pattern, flip } of SARCASM_PATTERNS) {
    if (pattern.test(text)) {
      if (flip) {
        const temp = posScore;
        posScore = negScore;
        negScore = temp + 1;
      }
    }
  }

  if (negScore > posScore) return "negative";
  if (posScore > negScore) return "positive";
  return "neutral";
}

function detectEmotion(text) {
  const lower = text.toLowerCase();
  let scores = { anger: 0, frustration: 0, satisfaction: 0, neutral: 0 };

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[emotion]++;
    }
  }

  // Exclamation marks indicate intensity
  const exclamations = (text.match(/!/g) || []).length;
  const caps = (text.match(/[A-Z]{3,}/g) || []).length;

  if (exclamations >= 2 || caps >= 1) {
    if (scores.anger > 0 || scores.frustration > 0) {
      scores.anger += exclamations;
      scores.frustration += caps;
    }
  }

  const maxEmotion = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0];

  if (maxEmotion[1] === 0) return "neutral";
  return maxEmotion[0];
}

function extractKeywords(text) {
  const lower = text.toLowerCase();
  const keywords = [];
  const words = lower.split(/\s+/).filter(w => w.length > 3);
  const stopwords = new Set(["this", "that", "with", "from", "have", "been", "will", "just", "about", "after", "also", "back", "could", "even", "first", "than", "into", "like", "make", "many", "most", "much", "only", "other", "over", "some", "such", "take", "then", "them", "they", "very", "when", "what", "your", "each", "does", "doing"]);

  for (const w of words) {
    if (!stopwords.has(w) &&
        (POSITIVE_WORDS.includes(w) || NEGATIVE_WORDS.includes(w) ||
         KNOWN_ASPECTS.includes(w) || Object.keys(ASPECT_ALIASES).includes(w))) {
      keywords.push(w);
    }
  }

  return [...new Set(keywords)].slice(0, 8);
}

function analyzeReview(processed) {
  const aspects = extractAspects(processed.clean_text);
  const aspectSentiment = {};

  for (const aspect of aspects) {
    aspectSentiment[aspect] = analyzeSentimentForAspect(
      processed.original_text || processed.clean_text,
      aspect
    );
  }

  const emotion = detectEmotion(processed.original_text || processed.clean_text);
  const keywords = extractKeywords(processed.clean_text);

  return {
    review_id: processed.review_id,
    aspects,
    aspect_sentiment: aspectSentiment,
    emotion,
    keywords,
    timestamp: processed.timestamp,
    rating: processed.rating,
    source: processed.source
  };
}

function analyzeAll(processedReviews) {
  return processedReviews.map(analyzeReview);
}

// ============================================================
// 4. INSIGHTS AGGREGATION
// ============================================================
function aggregateFeatureSentiment(aiOutputs) {
  const stats = {};

  for (const output of aiOutputs) {
    for (const [aspect, sentiment] of Object.entries(output.aspect_sentiment)) {
      if (!stats[aspect]) {
        stats[aspect] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      stats[aspect][sentiment]++;
      stats[aspect].total++;
    }
  }

  // Compute ratios
  const result = {};
  for (const [aspect, counts] of Object.entries(stats)) {
    const total = counts.total;
    result[aspect] = {
      positive: +(counts.positive / total).toFixed(2),
      negative: +(counts.negative / total).toFixed(2),
      neutral: +(counts.neutral / total).toFixed(2),
      total,
      counts
    };
  }

  return result;
}

function computeTrends(aiOutputs) {
  const trends = {};

  for (const output of aiOutputs) {
    const day = output.timestamp ? output.timestamp.split('T')[0] : 'unknown';

    for (const [aspect, sentiment] of Object.entries(output.aspect_sentiment)) {
      if (!trends[aspect]) trends[aspect] = {};
      if (!trends[aspect][day]) trends[aspect][day] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      trends[aspect][day][sentiment]++;
      trends[aspect][day].total++;
    }
  }

  return trends;
}

function detectSpikes(trends) {
  const alerts = {};

  for (const [aspect, days] of Object.entries(trends)) {
    const sortedDays = Object.keys(days).sort();
    if (sortedDays.length < 2) continue;

    const negCounts = sortedDays.map(d => days[d].negative);

    // Check last day vs average of previous
    for (let i = 1; i < sortedDays.length; i++) {
      const prevSlice = negCounts.slice(Math.max(0, i - 3), i);
      const avg = prevSlice.reduce((a, b) => a + b, 0) / prevSlice.length;

      if (avg > 0 && negCounts[i] > avg * THRESHOLDS.spike_multiplier) {
        const increase = Math.round(((negCounts[i] - avg) / avg) * 100);
        alerts[aspect] = {
          spike: true,
          day: sortedDays[i],
          current: negCounts[i],
          average: +avg.toFixed(1),
          increase_percent: increase
        };
      }
    }
  }

  return alerts;
}

function detectRootCauses(aiOutputs) {
  const causes = {};

  for (const output of aiOutputs) {
    const text = (output.keywords || []).join(' ') + ' ' +
      (output.aspects || []).join(' ');
    const originalReview = appState.processedReviews.find(r => r.review_id === output.review_id);
    const fullText = originalReview ? originalReview.original_text.toLowerCase() : text;

    for (const [keyword, cause] of Object.entries(ROOT_CAUSE_KEYWORDS)) {
      if (fullText.includes(keyword)) {
        for (const aspect of output.aspects) {
          if (output.aspect_sentiment[aspect] === 'negative') {
            if (!causes[aspect]) causes[aspect] = {};
            if (!causes[aspect][cause]) causes[aspect][cause] = 0;
            causes[aspect][cause]++;
          }
        }
      }
    }
  }

  // Pick top cause per aspect
  const result = {};
  for (const [aspect, causeMap] of Object.entries(causes)) {
    const sorted = Object.entries(causeMap).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) result[aspect] = sorted[0][0];
  }

  return result;
}

function aggregateEmotions(aiOutputs) {
  const counts = { anger: 0, frustration: 0, satisfaction: 0, neutral: 0 };
  for (const o of aiOutputs) {
    if (counts[o.emotion] !== undefined) counts[o.emotion]++;
  }
  return counts;
}

// ============================================================
// 5. DECISION ENGINE
// ============================================================
function generateDecisions(featureSentiment, trendAlerts, rootCauses) {
  const actions = [];
  const alerts = [];

  for (const [feature, stats] of Object.entries(featureSentiment)) {
    if (feature === 'general') continue;
    if (stats.total < THRESHOLDS.min_volume) continue;

    const negRatio = stats.negative;
    const posRatio = stats.positive;
    const spike = trendAlerts[feature];
    const cause = rootCauses[feature];

    // Rule 4: Combined Critical
    if (negRatio >= THRESHOLDS.high_negative && spike) {
      alerts.push({
        feature,
        priority: "critical",
        message: `Critical issue: ${feature} has high negative sentiment AND spike detected`,
        reason: `${Math.round(negRatio * 100)}% negative sentiment + ${spike.increase_percent}% spike in complaints`
      });
      actions.push({
        feature,
        priority: "critical",
        action: `Release immediate hotfix for ${feature} within 48 hours`,
        reason: `Combined signal: ${Math.round(negRatio * 100)}% negative + ${spike.increase_percent}% complaint increase${cause ? '. Likely cause: ' + cause : ''}`
      });
    }
    // Rule 1: High Negative
    else if (negRatio >= THRESHOLDS.high_negative) {
      alerts.push({
        feature,
        priority: "high",
        message: `High negative sentiment detected for ${feature}`,
        reason: `${Math.round(negRatio * 100)}% of ${stats.total} reviews are negative`
      });
      actions.push({
        feature,
        priority: "high",
        action: `Prioritize fixing ${feature} — high user dissatisfaction`,
        reason: `${Math.round(negRatio * 100)}% negative sentiment across ${stats.total} reviews${cause ? '. Possible cause: ' + cause : ''}`
      });
    }
    // Rule 3: Spike only
    else if (spike) {
      alerts.push({
        feature,
        priority: "high",
        message: `Sudden spike in ${feature} complaints detected`,
        reason: `${spike.increase_percent}% increase vs. previous ${Math.min(3, spike.current)} day average on ${spike.day}`
      });
      actions.push({
        feature,
        priority: "high",
        action: `Investigate recent changes affecting ${feature}`,
        reason: `Complaint spike of ${spike.increase_percent}%${cause ? '. Possible cause: ' + cause : ''}`
      });
    }
    // Rule 2: Moderate Negative
    else if (negRatio >= THRESHOLDS.medium_negative) {
      alerts.push({
        feature,
        priority: "medium",
        message: `Moderate negative sentiment for ${feature}`,
        reason: `${Math.round(negRatio * 100)}% negative — monitor closely`
      });
      actions.push({
        feature,
        priority: "medium",
        action: `Monitor ${feature} sentiment — potential issue developing`,
        reason: `${Math.round(negRatio * 100)}% negative sentiment, trending toward critical threshold`
      });
    }

    // Rule 5: Positive signal
    if (posRatio >= THRESHOLDS.positive_promote) {
      actions.push({
        feature,
        priority: "low",
        action: `Promote ${feature} in marketing campaigns — strong user satisfaction`,
        reason: `${Math.round(posRatio * 100)}% positive sentiment across ${stats.total} reviews`
      });
    }

    // Rule 7: Root cause
    if (cause && !actions.find(a => a.feature === feature && a.reason.includes(cause))) {
      alerts.push({
        feature,
        priority: "medium",
        message: `Root cause identified for ${feature} issues`,
        reason: `Likely caused by: ${cause}`
      });
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return { actions, alerts };
}

// ============================================================
// 6. PREDICTIONS (Simple linear extrapolation)
// ============================================================
function generatePredictions(aiOutputs) {
  const ratings = aiOutputs.filter(o => o.rating != null).map(o => o.rating);
  if (ratings.length < 2) return { current: 0, predicted: 0, trend: "stable" };

  const current = +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);

  // Split into halves for trend
  const mid = Math.floor(ratings.length / 2);
  const firstHalf = ratings.slice(0, mid);
  const secondHalf = ratings.slice(mid);

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const slope = avgSecond - avgFirst;
  const predicted = Math.max(1, Math.min(5, +(current + slope).toFixed(1)));

  let trend = "stable";
  if (slope < -0.2) trend = "declining";
  else if (slope > 0.2) trend = "improving";

  return { current, predicted, trend, slope: +slope.toFixed(2) };
}

// ============================================================
// FULL PIPELINE
// ============================================================
async function runPipeline(rawData) {
  appState.isProcessing = true;
  showLoading(true);

  try {
    // Stage 1: Ingest
    updateLoadingStep("📥 Ingesting reviews...");
    await sleep(400);
    appState.rawReviews = ingestReviews(rawData);
    updateStat('stat-raw', appState.rawReviews.length);

    // Stage 2: Preprocess
    updateLoadingStep("🧹 Preprocessing & cleaning...");
    setPipelineStage(1);
    await sleep(500);
    appState.processedReviews = preprocessAll(appState.rawReviews);
    updateStat('stat-processed', appState.processedReviews.length);

    // Stage 3: NLP Analysis
    updateLoadingStep("🧠 Running NLP analysis...");
    setPipelineStage(2);
    await sleep(600);
    appState.aiOutputs = analyzeAll(appState.processedReviews);

    // Stage 4: Aggregate Insights
    updateLoadingStep("📊 Aggregating insights...");
    setPipelineStage(3);
    await sleep(400);
    appState.featureSentiment = aggregateFeatureSentiment(appState.aiOutputs);
    appState.trends = computeTrends(appState.aiOutputs);
    appState.trendAlerts = detectSpikes(appState.trends);
    appState.rootCauses = detectRootCauses(appState.aiOutputs);
    appState.emotions = aggregateEmotions(appState.aiOutputs);
    appState.predictions = generatePredictions(appState.aiOutputs);
    appState.revenueImpact = calculateRevenueImpact(appState.predictions, appState.featureSentiment, appState.trendAlerts);


    const featuresDetected = Object.keys(appState.featureSentiment).filter(f => f !== 'general').length;
    updateStat('stat-features', featuresDetected);

    // Stage 5: Decision Engine
    updateLoadingStep("🎯 Generating decisions...");
    setPipelineStage(4);
    await sleep(400);
    const decisions = generateDecisions(
      appState.featureSentiment,
      appState.trendAlerts,
      appState.rootCauses
    );
    appState.actions = decisions.actions;
    appState.alerts = decisions.alerts;
    updateStat('stat-alerts', appState.alerts.length);
    updateStat('stat-actions', appState.actions.length);

    // Complete
    setPipelineStage(5);
    await sleep(300);
    showLoading(false);
    renderDashboard();
    showToast('success', `Analysis complete! Processed ${appState.rawReviews.length} reviews.`);
  } catch (err) {
    console.error('Pipeline error:', err);
    showLoading(false);
    showToast('error', 'Pipeline failed: ' + err.message);
  } finally {
    appState.isProcessing = false;
  }
}

// ============================================================
// UI RENDERING
// ============================================================
function renderDashboard() {
  const dashboard = document.getElementById('dashboard');
  dashboard.classList.add('visible');
  dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  renderRevenueImpact();
  renderFeatureSentiment();
  renderDonutCharts();
  renderTrendChart();
  renderAlerts();
  renderActions();
  renderPredictions();
  renderEmotions();
  renderProcessedReviews();
}

function renderFeatureSentiment() {
  const container = document.getElementById('feature-sentiment-list');
  const features = Object.entries(appState.featureSentiment)
    .filter(([k]) => k !== 'general')
    .sort((a, b) => b[1].total - a[1].total);

  container.innerHTML = features.map(([feature, stats], i) => {
    const icon = FEATURE_ICONS[feature] || '📋';
    const posW = Math.max(stats.positive * 100, stats.positive > 0 ? 8 : 0);
    const negW = Math.max(stats.negative * 100, stats.negative > 0 ? 8 : 0);
    const neuW = Math.max(100 - posW - negW, 0);

    return `
      <div class="feature-item" style="animation-delay: ${i * 0.08}s">
        <div class="feature-header">
          <span class="feature-name">${icon} ${capitalize(feature)}</span>
          <span class="feature-count">${stats.total} reviews</span>
        </div>
        <div class="sentiment-bar-container">
          <div class="sentiment-segment positive" style="width: ${posW}%">${stats.positive > 0.08 ? Math.round(stats.positive * 100) + '%' : ''}</div>
          <div class="sentiment-segment negative" style="width: ${negW}%">${stats.negative > 0.08 ? Math.round(stats.negative * 100) + '%' : ''}</div>
          <div class="sentiment-segment neutral" style="width: ${neuW}%">${stats.neutral > 0.08 ? Math.round(stats.neutral * 100) + '%' : ''}</div>
        </div>
        <div class="sentiment-labels">
          <span class="sentiment-label"><span class="sentiment-dot pos"></span>${Math.round(stats.positive * 100)}% Positive</span>
          <span class="sentiment-label"><span class="sentiment-dot neg"></span>${Math.round(stats.negative * 100)}% Negative</span>
          <span class="sentiment-label"><span class="sentiment-dot neu"></span>${Math.round(stats.neutral * 100)}% Neutral</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderDonutCharts() {
  const container = document.getElementById('donut-grid');
  const features = Object.entries(appState.featureSentiment)
    .filter(([k]) => k !== 'general')
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8);

  container.innerHTML = features.map(([feature, stats]) => {
    const icon = FEATURE_ICONS[feature] || '📋';
    const dominant = stats.negative >= stats.positive ? 'negative' :
                     stats.positive > stats.negative ? 'positive' : 'neutral';
    return `
      <div class="donut-item">
        <canvas class="donut-canvas" id="donut-${feature}" width="100" height="100"></canvas>
        <div class="donut-label">${icon} ${capitalize(feature)}</div>
        <div class="donut-sublabel">${Math.round(stats[dominant] * 100)}% ${dominant}</div>
      </div>
    `;
  }).join('');

  // Draw donuts
  requestAnimationFrame(() => {
    for (const [feature, stats] of features) {
      drawDonut(`donut-${feature}`, stats);
    }
  });
}

function drawDonut(canvasId, stats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 100;
  const center = size / 2;
  const radius = 38;
  const lineWidth = 10;

  canvas.width = size * 2;
  canvas.height = size * 2;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(2, 2);

  const colors = {
    positive: '#00d2d3',
    negative: '#ff6b6b',
    neutral: '#feca57'
  };

  const segments = [
    { value: stats.positive, color: colors.positive },
    { value: stats.negative, color: colors.negative },
    { value: stats.neutral, color: colors.neutral }
  ].filter(s => s.value > 0);

  let startAngle = -Math.PI / 2;

  // Background ring
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  // Animated drawing
  for (const seg of segments) {
    const sweepAngle = seg.value * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, startAngle + sweepAngle);
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    startAngle += sweepAngle;
  }

  // Center text
  const dominant = stats.negative >= stats.positive && stats.negative >= stats.neutral ? stats.negative :
                   stats.positive >= stats.neutral ? stats.positive : stats.neutral;
  ctx.fillStyle = '#e8eaf6';
  ctx.font = 'bold 16px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(dominant * 100) + '%', center, center);
}

function renderTrendChart() {
  const canvas = document.getElementById('trend-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  const width = container.clientWidth;
  const height = 220;

  canvas.width = width * 2;
  canvas.height = height * 2;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(2, 2);

  // Get top 5 features with negative trends
  const features = Object.entries(appState.trends)
    .filter(([k]) => k !== 'general')
    .sort((a, b) => Object.keys(b[1]).length - Object.keys(a[1]).length)
    .slice(0, 5);

  if (features.length === 0) return;

  // Collect all days
  const allDays = new Set();
  for (const [, days] of features) {
    Object.keys(days).forEach(d => allDays.add(d));
  }
  const sortedDays = [...allDays].sort();

  const chartColors = ['#ff6b6b', '#6c5ce7', '#00d2d3', '#feca57', '#fd79a8'];

  const padding = { top: 20, right: 20, bottom: 35, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Find max value
  let maxVal = 0;
  for (const [, days] of features) {
    for (const counts of Object.values(days)) {
      if (counts.negative > maxVal) maxVal = counts.negative;
    }
  }
  maxVal = Math.max(maxVal, 1);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(232,234,246,0.3)';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padding.left - 8, y + 4);
  }

  // X labels
  ctx.fillStyle = 'rgba(232,234,246,0.35)';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'center';
  for (let i = 0; i < sortedDays.length; i++) {
    const x = padding.left + (chartW / Math.max(sortedDays.length - 1, 1)) * i;
    const label = sortedDays[i].split('-').slice(1).join('/');
    ctx.fillText(label, x, height - 8);
  }

  // Draw lines
  features.forEach(([feature, days], fi) => {
    const color = chartColors[fi % chartColors.length];
    const points = sortedDays.map((day, i) => {
      const val = days[day] ? days[day].negative : 0;
      return {
        x: padding.left + (chartW / Math.max(sortedDays.length - 1, 1)) * i,
        y: padding.top + chartH - (val / maxVal) * chartH
      };
    });

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Area fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = color.replace(')', ',0.08)').replace('rgb', 'rgba');
    ctx.fill();

    // Points
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0e1a';
      ctx.fill();
    }

    // Spike markers
    if (appState.trendAlerts[feature]) {
      const spikeDay = appState.trendAlerts[feature].day;
      const idx = sortedDays.indexOf(spikeDay);
      if (idx !== -1) {
        const p = points[idx];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff3b5c';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ff3b5c';
        ctx.font = 'bold 9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('SPIKE', p.x, p.y - 14);
      }
    }
  });

  // Legend
  const legendContainer = document.getElementById('trend-legend');
  legendContainer.innerHTML = features.map(([feature], i) => {
    const color = chartColors[i % chartColors.length];
    return `<span class="legend-item"><span class="legend-color" style="background:${color}"></span>${capitalize(feature)} (negative)</span>`;
  }).join('');
}

function renderAlerts() {
  const container = document.getElementById('alerts-list');

  if (appState.alerts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-text">No significant alerts detected. All features are within normal parameters.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = appState.alerts.map((alert, i) => {
    const icon = FEATURE_ICONS[alert.feature] || '📋';
    const config = PRIORITY_CONFIG[alert.priority];
    return `
      <div class="alert-card ${alert.priority}" style="animation-delay: ${i * 0.1}s">
        <div class="alert-priority">${config.icon} ${config.label}</div>
        <div class="alert-message">${alert.message}</div>
        <div class="alert-reason">📎 ${alert.reason}</div>
        <span class="alert-feature-tag">${icon} ${capitalize(alert.feature)}</span>
      </div>
    `;
  }).join('');
}

function renderActions() {
  const container = document.getElementById('actions-list');

  if (appState.actions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <div class="empty-state-text">No actions required. Product sentiment is healthy.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = appState.actions.map((action, i) => {
    const icon = FEATURE_ICONS[action.feature] || '📋';
    return `
      <div class="action-card" style="animation-delay: ${i * 0.1}s">
        <div class="action-card-header">
          <div class="action-text">${action.action}</div>
          <span class="action-priority-badge ${action.priority}">${action.priority}</span>
        </div>
        <div class="action-reason">💡 ${action.reason}</div>
        <span class="action-feature">${icon} ${capitalize(action.feature)}</span>
      </div>
    `;
  }).join('');
}

function renderPredictions() {
  const container = document.getElementById('predictions-content');
  const pred = appState.predictions;

  if (!pred || pred.current === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔮</div><div class="empty-state-text">Insufficient data for predictions.</div></div>`;
    return;
  }

  const trendClass = pred.trend === 'declining' ? 'down' : pred.trend === 'improving' ? 'up' : 'stable';
  const arrow = pred.trend === 'declining' ? '↘' : pred.trend === 'improving' ? '↗' : '→';
  const trendColor = pred.trend === 'declining' ? 'var(--negative)' : pred.trend === 'improving' ? 'var(--positive)' : 'var(--neutral)';

  container.innerHTML = `
    <div class="prediction-card">
      <div class="prediction-label">Current Avg Rating</div>
      <div class="prediction-value ${trendClass}">${pred.current} ⭐</div>
    </div>
    <div class="prediction-card">
      <div class="prediction-label">Predicted Rating (2 weeks)</div>
      <div class="prediction-value ${trendClass}">
        ${pred.current} <span class="prediction-arrow" style="color:${trendColor}">${arrow}</span> ${pred.predicted}
      </div>
      <div class="prediction-detail" style="color:${trendColor}">
        Trend: ${capitalize(pred.trend)} (${pred.slope > 0 ? '+' : ''}${pred.slope})
      </div>
    </div>
  `;
}

function renderEmotions() {
  const container = document.getElementById('emotions-content');
  const total = Object.values(appState.emotions).reduce((a, b) => a + b, 0);
  if (total === 0) return;

  const emotionIcons = { anger: '😡', frustration: '😤', satisfaction: '😊', neutral: '😐' };

  container.innerHTML = `<div class="emotion-bars">` +
    Object.entries(appState.emotions)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
          <div class="emotion-item">
            <span class="emotion-label-text">${emotionIcons[emotion] || ''} ${capitalize(emotion)}</span>
            <div class="emotion-bar-bg">
              <div class="emotion-bar-fill ${emotion}" style="width: ${pct}%">${pct}%</div>
            </div>
          </div>
        `;
      }).join('') +
    `</div>`;
}

function renderProcessedReviews() {
  const container = document.getElementById('reviews-grid');
  const reviews = appState.aiOutputs.slice(0, 20); // Show first 20

  container.innerHTML = reviews.map(output => {
    const proc = appState.processedReviews.find(r => r.review_id === output.review_id);
    const text = proc ? proc.original_text : '';
    const rating = output.rating ? '⭐'.repeat(Math.round(output.rating)) : '';
    const source = output.source || 'unknown';

    const aspectTags = Object.entries(output.aspect_sentiment).map(([asp, sent]) => {
      return `<span class="aspect-tag ${sent}">${FEATURE_ICONS[asp] || ''} ${asp}: ${sent}</span>`;
    }).join('');

    return `
      <div class="review-card">
        <div class="review-card-text">"${text}"</div>
        <div class="review-card-meta">
          <span class="review-rating">${rating}</span>
          <span class="review-source">${source}</span>
        </div>
        <div class="review-aspects">${aspectTags}</div>
      </div>
    `;
  }).join('');
}

// ============================================================
// UI HELPERS
// ============================================================
function showLoading(visible) {
  const overlay = document.getElementById('loading-overlay');
  if (visible) overlay.classList.add('visible');
  else overlay.classList.remove('visible');
}

function updateLoadingStep(text) {
  const el = document.getElementById('loading-step');
  if (el) el.textContent = text;
}

function setPipelineStage(stage) {
  const steps = document.querySelectorAll('.pipeline-step');
  const connectors = document.querySelectorAll('.pipeline-connector');

  steps.forEach((step, i) => {
    step.classList.remove('active', 'completed');
    if (i < stage) step.classList.add('completed');
    else if (i === stage) step.classList.add('active');
  });

  connectors.forEach((conn, i) => {
    conn.classList.remove('active', 'completed');
    if (i < stage - 1) conn.classList.add('completed');
    else if (i === stage - 1) conn.classList.add('active');
  });
}

function updateStat(id, value) {
  const el = document.getElementById(id);
  if (el) animateCounter(el, value);
}

function animateCounter(el, target) {
  const duration = 600;
  const start = parseInt(el.textContent) || 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function showToast(type, message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// INPUT HANDLERS
// ============================================================
function parseTextInput(text) {
  // Split by newlines, each line is a review
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  return lines.map((line, i) => ({
    review_id: `USR-${Date.now()}-${i + 1}`,
    text: line.trim(),
    rating: null,
    timestamp: new Date().toISOString(),
    source: "user_input"
  }));
}

function parseJsonInput(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data)) return data;
    if (data.reviews && Array.isArray(data.reviews)) return data.reviews;
    return [data];
  } catch (e) {
    showToast('error', 'Invalid JSON format. Please check your input.');
    return [];
  }
}

// ============================================================
// INITIALIZATION
// ============================================================
function initApp() {
  // Tab switching
  document.querySelectorAll('.input-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.input-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.input-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel).classList.add('active');
    });
  });

  // Analyze button
  document.getElementById('btn-analyze').addEventListener('click', () => {
    if (appState.isProcessing) return;
    const activeTab = document.querySelector('.input-tab.active').dataset.panel;
    let reviews = [];

    if (activeTab === 'panel-text') {
      const text = document.getElementById('review-text-input').value.trim();
      if (!text) { showToast('error', 'Please enter at least one review.'); return; }
      reviews = parseTextInput(text);
    } else if (activeTab === 'panel-json') {
      const json = document.getElementById('review-json-input').value.trim();
      if (!json) { showToast('error', 'Please enter JSON data.'); return; }
      reviews = parseJsonInput(json);
    } else if (activeTab === 'panel-sample') {
      reviews = [...SAMPLE_REVIEWS];
    }

    if (reviews.length === 0) {
      showToast('error', 'No valid reviews to analyze.');
      return;
    }

    runPipeline(reviews);
  });

  // Load sample button
  document.getElementById('btn-load-sample').addEventListener('click', () => {
    document.querySelectorAll('.input-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.input-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('[data-panel="panel-sample"]').classList.add('active');
    document.getElementById('panel-sample').classList.add('active');
    showToast('info', `${SAMPLE_REVIEWS.length} sample reviews loaded. Click "Run Analysis" to start!`);
  });

  // Clear button
  document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('review-text-input').value = '';
    document.getElementById('review-json-input').value = '';
    document.getElementById('dashboard').classList.remove('visible');
    appState = {
      rawReviews: [], processedReviews: [], aiOutputs: [],
      featureSentiment: {}, trends: {}, trendAlerts: {},
      rootCauses: {}, emotions: {}, actions: [], alerts: [],
      predictions: {}, 
      revenueImpact: {
        loss: 0, churnIncrease: 0, topLiability: "--",
        recovery: 0, currentRating: 0, predictedRating: 0
      },
      isProcessing: false
    };
    ['stat-raw', 'stat-processed', 'stat-features', 'stat-alerts', 'stat-actions'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '0';
    });
    setPipelineStage(-1);
    showToast('info', 'Dashboard cleared.');
  });

  // Window resize for trend chart
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (appState.aiOutputs.length > 0) renderTrendChart();
    }, 250);
  });
}

// ============================================================
// 7. REVENUE IMPACT LOGIC
// ============================================================
function calculateRevenueImpact(predictions, featureSentiment, trendAlerts) {
  const cfg = BUSINESS_CONFIG;
  const currentRating = predictions.current || 4.2; // Use actual avg or fall back to high baseline
  const predictedRating = predictions.predicted || currentRating;

  const ratingDelta = Math.max(0, currentRating - predictedRating);
  
  // Logic: Churn % increase = (Rating Drop) * Churn Per Rating Drop
  const churnIncrease = ratingDelta * cfg.churn_per_rating_drop;
  
  // Monthly Revenue = Users * ARPU
  const totalMonthlyRevenue = cfg.total_users * cfg.arpu_monthly;
  
  // Revenue Loss = Total Revenue * Churn Increase
  const monthlyLoss = totalMonthlyRevenue * churnIncrease;
  
  // Identifying Top Liability (Feature with most negative sentiment + spike)
  let topLiability = "--";
  let maxNegImpact = -1;

  for (const [feature, stats] of Object.entries(featureSentiment)) {
    if (feature === 'general') continue;
    
    // Impact score = (negative ratio) * (total reviews) * (1.5 if spike detected)
    let impactScore = stats.negative * stats.total;
    if (trendAlerts[feature]) impactScore *= 1.5;

    if (impactScore > maxNegImpact) {
      maxNegImpact = impactScore;
      topLiability = feature;
    }
  }

  const liabilityExposure = monthlyLoss * (maxNegImpact > 0 ? 0.6 : 0); // Est. 60% of loss attributed to top feature

  return {
    loss: monthlyLoss / cfg.currency_multiplier, // Convert to Cr
    churnIncrease: churnIncrease * 100, // Convert to %
    topLiability,
    exposure: liabilityExposure / cfg.currency_multiplier,
    recovery: monthlyLoss / cfg.currency_multiplier,
    currentRating,
    predictedRating
  };
}

function renderRevenueImpact() {
  const rev = appState.revenueImpact;
  const cfg = BUSINESS_CONFIG;

  const elLoss = document.getElementById('est-revenue-loss');
  const elLossSub = document.getElementById('revenue-loss-sub');
  const elChurn = document.getElementById('est-churn-increase');
  const elChurnBar = document.getElementById('churn-progress');
  const elLiability = document.getElementById('top-liability-feature');
  const elLiabilityCost = document.getElementById('top-liability-cost');
  const elRecovery = document.getElementById('recovery-potential');

  if (elLoss) elLoss.textContent = `${cfg.currency_symbol}${rev.loss.toFixed(2)} ${cfg.currency_suffix}`;
  if (elLossSub) elLossSub.textContent = `Driven by ${rev.currentRating.toFixed(1)} → ${rev.predictedRating.toFixed(1)} rating Δ`;
  
  if (elChurn) elChurn.textContent = `+${rev.churnIncrease.toFixed(1)}%`;
  if (elChurnBar) elChurnBar.style.width = `${Math.min(100, rev.churnIncrease * 5)}%`;
  
  if (elLiability) {
    const icon = FEATURE_ICONS[rev.topLiability] || '';
    elLiability.textContent = `${icon} ${capitalize(rev.topLiability)}`;
  }
  if (elLiabilityCost) elLiabilityCost.textContent = `${cfg.currency_symbol}${rev.exposure.toFixed(1)} ${cfg.currency_suffix} exposure`;
  
  if (elRecovery) elRecovery.textContent = `${cfg.currency_symbol}${rev.recovery.toFixed(2)} ${cfg.currency_suffix}`;
}

// Boot
document.addEventListener('DOMContentLoaded', initApp);
