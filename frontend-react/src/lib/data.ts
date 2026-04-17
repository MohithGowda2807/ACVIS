// ─── ACVIS Data Layer ───
// Ported from frontend/js/data.js — real production data

export const ASPECT_ALIASES: Record<string, string[]> = {
  battery: ['battery', 'charging', 'charge', 'power', 'drain', 'mah', 'backup'],
  camera: ['camera', 'photo', 'video', 'lens', 'selfie', 'portrait', 'zoom', 'night mode', 'picture'],
  ui: ['ui', 'interface', 'design', 'theme', 'layout', 'menu', 'navigation', 'ux', 'one ui', 'oneui', 'miui'],
  performance: ['performance', 'speed', 'lag', 'slow', 'fast', 'smooth', 'hang', 'freeze', 'ram', 'processor', 'snapdragon', 'chipset'],
  display: ['display', 'screen', 'amoled', 'lcd', 'brightness', 'refresh rate', 'resolution', 'hdr'],
  audio: ['audio', 'speaker', 'sound', 'volume', 'bass', 'dolby', 'earphone', 'mic'],
  storage: ['storage', 'memory', 'gb', 'space', 'expandable'],
  connectivity: ['wifi', 'bluetooth', 'network', '5g', '4g', 'signal', 'gps', 'nfc'],
  durability: ['build', 'quality', 'gorilla', 'scratch', 'drop', 'water', 'dust', 'ip68', 'durable'],
  software: ['software', 'update', 'os', 'android', 'ios', 'bug', 'crash', 'app', 'bloatware', 'ads'],
  price: ['price', 'value', 'cost', 'worth', 'expensive', 'cheap', 'budget', 'premium', 'money'],
  support: ['support', 'service', 'warranty', 'customer care', 'helpline'],
  heating: ['heat', 'hot', 'warm', 'thermal', 'overheat', 'temperature'],
  fingerprint: ['fingerprint', 'face unlock', 'biometric', 'face id', 'sensor'],
  general: ['phone', 'device', 'product', 'mobile', 'handset']
};

export const POSITIVE_WORDS = [
  'good', 'great', 'excellent', 'amazing', 'awesome', 'love', 'best',
  'perfect', 'fantastic', 'wonderful', 'impressive', 'superb', 'smooth',
  'fast', 'beautiful', 'brilliant', 'outstanding', 'solid', 'premium',
  'clear', 'bright', 'sharp', 'reliable', 'crisp', 'stunning',
  'satisfied', 'happy', 'recommend', 'worth', 'improved', 'responsive',
  'convenient', 'comfortable', 'enjoy', 'effortless', 'intuitive',
  'sleek', 'elegant', 'top-notch', 'exceptional', 'flawless'
];

export const NEGATIVE_WORDS = [
  'bad', 'poor', 'worst', 'terrible', 'horrible', 'hate', 'awful',
  'slow', 'lag', 'hang', 'crash', 'freeze', 'drain', 'dead', 'broke',
  'disappointed', 'useless', 'waste', 'overpriced', 'ugly', 'cheap',
  'blurry', 'dim', 'weak', 'noisy', 'bloated', 'heavy', 'annoying',
  'frustrating', 'pathetic', 'mediocre', 'regret', 'refund', 'issue',
  'problem', 'defect', 'malfunction', 'unresponsive', 'broken',
  'glitch', 'stutter', 'overheat', 'overheating', 'fails', 'unusable',
  'trash'
];

export const SARCASM_PATTERNS = [
  /great.{0,10}(crash|lag|freeze|drain|die|fail|broke)/i,
  /love.{0,10}(crash|lag|waiting|buffer|freeze|bug)/i,
  /amazing.{0,10}(slow|lag|drain|crash|heat|bug)/i,
  /wow.{0,10}(bad|poor|terrible|slow|crash)/i,
  /fantastic.{0,10}(lag|crash|drain|hang|bug)/i,
  /perfect.{0,10}(crash|fail|bug|freeze|drain)/i,
  /thank.{0,10}(nothing|waste|ruin|destroy|break)/i,
  /best.{0,10}(joke|waste|mistake|worst|never)/i
];

export const EMOTION_KEYWORDS: Record<string, string[]> = {
  anger: ['angry', 'furious', 'hate', 'rage', 'livid', 'worst', 'trash', 'garbage', 'pathetic', 'disgusting', 'scam'],
  frustration: ['frustrat', 'annoying', 'irritat', 'disappoint', 'tire', 'sick of', 'fed up', "can't believe", 'regret', 'useless', 'waste'],
  satisfaction: ['happy', 'satisfied', 'love', 'enjoy', 'pleased', 'delight', 'glad', 'recommend', 'impress', 'perfect', 'thank'],
  neutral: []
};

export const ROOT_CAUSE_KEYWORDS = ['update', 'patch', 'firmware', 'version', 'v2', 'v3', 'latest', 'recent', 'after', 'since', 'new', 'changed'];

export const BUSINESS_CONFIG = {
  total_users: 5_000_000,
  arpu_monthly: 149,
  churn_per_rating_drop: 0.08,
  currency_symbol: '₹',
  currency_suffix: 'Cr',
  currency_multiplier: 10_000_000,
  spike_threshold: 2.0
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: 'CRITICAL', color: '#dc2626' },
  high: { label: 'HIGH', color: '#d97706' },
  medium: { label: 'MEDIUM', color: '#6b7280' },
  low: { label: 'LOW', color: '#2563eb' }
};

export const CHART_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#d97706', '#8b5cf6', '#ec4899'
];

// ─── Sample Reviews (55 real-format reviews, 7-day spread with intentional spike) ───
export const SAMPLE_REVIEWS: Review[] = [
  { review_id: "R001", text: "Battery life is excellent, easily lasts a full day with heavy usage.", rating: 5, timestamp: "2026-04-01T10:00:00Z", source: "playstore" },
  { review_id: "R002", text: "Camera quality is stunning, especially in portrait mode.", rating: 5, timestamp: "2026-04-01T11:00:00Z", source: "amazon" },
  { review_id: "R003", text: "UI feels smooth and responsive, love the new design.", rating: 4, timestamp: "2026-04-01T12:00:00Z", source: "playstore" },
  { review_id: "R004", text: "Good performance for gaming, no lag at all.", rating: 4, timestamp: "2026-04-01T14:00:00Z", source: "amazon" },
  { review_id: "R005", text: "Display is bright and vivid, great for watching videos.", rating: 5, timestamp: "2026-04-01T15:00:00Z", source: "twitter" },
  { review_id: "R006", text: "Fingerprint sensor is blazing fast.", rating: 4, timestamp: "2026-04-01T16:00:00Z", source: "playstore" },
  { review_id: "R007", text: "Storage space is generous, no complaints.", rating: 4, timestamp: "2026-04-01T17:00:00Z", source: "amazon" },
  { review_id: "R008", text: "Audio quality from speakers is decent but not the best.", rating: 3, timestamp: "2026-04-01T18:00:00Z", source: "playstore" },
  { review_id: "R009", text: "Battery drains slightly faster than expected during video calls.", rating: 3, timestamp: "2026-04-02T09:00:00Z", source: "amazon" },
  { review_id: "R010", text: "Camera night mode is impressive, very detailed shots.", rating: 5, timestamp: "2026-04-02T10:00:00Z", source: "playstore" },
  { review_id: "R011", text: "The UI has too many pre-installed apps, feels bloated.", rating: 2, timestamp: "2026-04-02T11:00:00Z", source: "playstore" },
  { review_id: "R012", text: "Performance is okay for daily tasks but struggles with heavy games.", rating: 3, timestamp: "2026-04-02T13:00:00Z", source: "amazon" },
  { review_id: "R013", text: "Great value for the price, definitely recommend.", rating: 5, timestamp: "2026-04-02T14:00:00Z", source: "twitter" },
  { review_id: "R014", text: "Build quality is premium, feels solid in hand.", rating: 4, timestamp: "2026-04-02T15:00:00Z", source: "amazon" },
  { review_id: "R015", text: "Software updates have been timely and useful.", rating: 4, timestamp: "2026-04-02T16:00:00Z", source: "playstore" },
  { review_id: "R016", text: "After the latest update, battery drains like crazy! Went from full to 20% in 3 hours.", rating: 1, timestamp: "2026-04-03T08:00:00Z", source: "playstore" },
  { review_id: "R017", text: "Update v2.1 completely ruined my battery life. Phone dies by noon.", rating: 1, timestamp: "2026-04-03T09:00:00Z", source: "playstore" },
  { review_id: "R018", text: "Battery is draining fast since the firmware update. Very disappointed.", rating: 2, timestamp: "2026-04-03T10:00:00Z", source: "amazon" },
  { review_id: "R019", text: "Camera is still great though, no issues there.", rating: 4, timestamp: "2026-04-03T11:00:00Z", source: "playstore" },
  { review_id: "R020", text: "Phone overheats after the update, especially during charging.", rating: 1, timestamp: "2026-04-03T12:00:00Z", source: "twitter" },
  { review_id: "R021", text: "Performance feels sluggish since the new version.", rating: 2, timestamp: "2026-04-03T13:00:00Z", source: "playstore" },
  { review_id: "R022", text: "Battery backup has dropped significantly. Please fix this!", rating: 2, timestamp: "2026-04-03T14:00:00Z", source: "amazon" },
  { review_id: "R023", text: "Great, another update that crashes my phone. Thanks for nothing.", rating: 1, timestamp: "2026-04-03T15:00:00Z", source: "playstore" },
  { review_id: "R024", text: "Battery is pathetic now. Can't even last half a day.", rating: 1, timestamp: "2026-04-04T08:00:00Z", source: "playstore" },
  { review_id: "R025", text: "My phone battery is dead by lunchtime since the update.", rating: 1, timestamp: "2026-04-04T09:00:00Z", source: "amazon" },
  { review_id: "R026", text: "Worst battery performance I've ever seen on any phone.", rating: 1, timestamp: "2026-04-04T10:00:00Z", source: "twitter" },
  { review_id: "R027", text: "UI is still nice, but what's the point if the phone dies in 4 hours?", rating: 2, timestamp: "2026-04-04T11:00:00Z", source: "playstore" },
  { review_id: "R028", text: "Camera zoom has improved but battery drain is unbearable.", rating: 2, timestamp: "2026-04-04T12:00:00Z", source: "playstore" },
  { review_id: "R029", text: "Overheating and battery drain together. Feels like a regression.", rating: 1, timestamp: "2026-04-04T13:00:00Z", source: "amazon" },
  { review_id: "R030", text: "Amazing how fast the battery drains now. What did you do?!", rating: 1, timestamp: "2026-04-04T14:00:00Z", source: "playstore" },
  { review_id: "R031", text: "Performance is still good for regular apps.", rating: 4, timestamp: "2026-04-04T15:00:00Z", source: "amazon" },
  { review_id: "R032", text: "Display quality is top-notch, love the AMOLED.", rating: 5, timestamp: "2026-04-04T16:00:00Z", source: "playstore" },
  { review_id: "R033", text: "Battery issue is ruining the overall experience.", rating: 2, timestamp: "2026-04-04T17:00:00Z", source: "twitter" },
  { review_id: "R034", text: "Still no fix for the battery drain. Considering returning the phone.", rating: 1, timestamp: "2026-04-05T09:00:00Z", source: "playstore" },
  { review_id: "R035", text: "Camera continues to impress, best in this segment.", rating: 5, timestamp: "2026-04-05T10:00:00Z", source: "amazon" },
  { review_id: "R036", text: "Battery is unusable. I have to charge 3 times a day now.", rating: 1, timestamp: "2026-04-05T11:00:00Z", source: "playstore" },
  { review_id: "R037", text: "Good phone overall but the battery issue needs urgent attention.", rating: 3, timestamp: "2026-04-05T12:00:00Z", source: "amazon" },
  { review_id: "R038", text: "UI has gotten some ads now. Very annoying bloatware.", rating: 2, timestamp: "2026-04-05T14:00:00Z", source: "playstore" },
  { review_id: "R039", text: "Support team is unresponsive, no help with battery issue.", rating: 1, timestamp: "2026-04-05T15:00:00Z", source: "twitter" },
  { review_id: "R040", text: "Fingerprint sometimes fails to register after the update.", rating: 2, timestamp: "2026-04-05T16:00:00Z", source: "playstore" },
  { review_id: "R041", text: "Battery drain persists. This phone used to be amazing.", rating: 2, timestamp: "2026-04-06T09:00:00Z", source: "amazon" },
  { review_id: "R042", text: "Camera selfie mode has gotten better with the update.", rating: 4, timestamp: "2026-04-06T10:00:00Z", source: "playstore" },
  { review_id: "R043", text: "Phone gets really hot during gaming now.", rating: 2, timestamp: "2026-04-06T12:00:00Z", source: "playstore" },
  { review_id: "R044", text: "Display brightness auto-adjust works great in sunlight.", rating: 4, timestamp: "2026-04-06T13:00:00Z", source: "amazon" },
  { review_id: "R045", text: "Charging speed is still fast, at least that works.", rating: 3, timestamp: "2026-04-06T14:00:00Z", source: "playstore" },
  { review_id: "R046", text: "I love this phone except for the battery. Please fix it.", rating: 3, timestamp: "2026-04-06T15:00:00Z", source: "twitter" },
  { review_id: "R047", text: "Battery seems slightly better today. Did they push a silent fix?", rating: 3, timestamp: "2026-04-07T09:00:00Z", source: "playstore" },
  { review_id: "R048", text: "Camera is consistently the best feature of this phone.", rating: 5, timestamp: "2026-04-07T10:00:00Z", source: "amazon" },
  { review_id: "R049", text: "Performance is back to normal after clearing cache.", rating: 4, timestamp: "2026-04-07T11:00:00Z", source: "playstore" },
  { review_id: "R050", text: "Still some battery drain but not as bad as last week.", rating: 3, timestamp: "2026-04-07T12:00:00Z", source: "amazon" },
  { review_id: "R051", text: "Value for money is still great considering all features.", rating: 4, timestamp: "2026-04-07T13:00:00Z", source: "twitter" },
  { review_id: "R052", text: "Software stability has improved with the minor patch.", rating: 4, timestamp: "2026-04-07T14:00:00Z", source: "playstore" },
  { review_id: "R053", text: "Audio quality in calls is crystal clear.", rating: 4, timestamp: "2026-04-07T15:00:00Z", source: "amazon" },
  { review_id: "R054", text: "Build quality feels premium for this price range.", rating: 5, timestamp: "2026-04-07T16:00:00Z", source: "playstore" },
  { review_id: "R055", text: "Overall a good phone but needs battery optimization badly.", rating: 3, timestamp: "2026-04-07T17:00:00Z", source: "playstore" },
];

export const SAMPLE_COMPETITOR_REVIEWS: Review[] = [
  { review_id: "C001", text: "Battery life is decent, lasts a full day.", rating: 4, timestamp: "2026-04-03T10:00:00Z", source: "amazon" },
  { review_id: "C002", text: "Camera is average, nothing special in low light.", rating: 3, timestamp: "2026-04-03T11:00:00Z", source: "playstore" },
  { review_id: "C003", text: "UI is clean and minimal, no bloatware.", rating: 5, timestamp: "2026-04-03T12:00:00Z", source: "amazon" },
  { review_id: "C004", text: "Performance is smooth for daily tasks.", rating: 4, timestamp: "2026-04-03T13:00:00Z", source: "playstore" },
  { review_id: "C005", text: "Battery drains a bit during heavy gaming.", rating: 3, timestamp: "2026-04-03T14:00:00Z", source: "amazon" },
  { review_id: "C006", text: "Camera zoom is quite poor compared to competitors.", rating: 2, timestamp: "2026-04-04T09:00:00Z", source: "playstore" },
  { review_id: "C007", text: "UI has too many settings to configure.", rating: 3, timestamp: "2026-04-04T10:00:00Z", source: "amazon" },
  { review_id: "C008", text: "Phone is fast and responsive.", rating: 5, timestamp: "2026-04-04T11:00:00Z", source: "playstore" },
  { review_id: "C009", text: "Battery is okay, not great not terrible.", rating: 3, timestamp: "2026-04-04T12:00:00Z", source: "twitter" },
  { review_id: "C010", text: "Camera struggles in night photography.", rating: 2, timestamp: "2026-04-04T13:00:00Z", source: "amazon" },
  { review_id: "C011", text: "Performance degrades after a few months.", rating: 2, timestamp: "2026-04-05T09:00:00Z", source: "playstore" },
  { review_id: "C012", text: "UI is intuitive and user-friendly.", rating: 4, timestamp: "2026-04-05T10:00:00Z", source: "amazon" },
  { review_id: "C013", text: "Battery holds up well with moderate usage.", rating: 4, timestamp: "2026-04-05T11:00:00Z", source: "playstore" },
  { review_id: "C014", text: "Camera video recording is shaky without stabilization.", rating: 2, timestamp: "2026-04-05T12:00:00Z", source: "twitter" },
  { review_id: "C015", text: "Good value for the price point.", rating: 4, timestamp: "2026-04-05T13:00:00Z", source: "amazon" },
  { review_id: "C016", text: "Performance lags when multitasking.", rating: 2, timestamp: "2026-04-06T09:00:00Z", source: "playstore" },
  { review_id: "C017", text: "Battery is reliable, no complaints.", rating: 4, timestamp: "2026-04-06T10:00:00Z", source: "amazon" },
  { review_id: "C018", text: "UI could use more customization options.", rating: 3, timestamp: "2026-04-06T11:00:00Z", source: "playstore" },
  { review_id: "C019", text: "Camera app crashes occasionally.", rating: 2, timestamp: "2026-04-06T12:00:00Z", source: "twitter" },
  { review_id: "C020", text: "Overall decent phone for the budget segment.", rating: 3, timestamp: "2026-04-06T13:00:00Z", source: "amazon" }
];

// ─── Types ───
export interface Review {
  review_id: string;
  text: string;
  rating: number | null;
  timestamp: string;
  source: string;
}

export interface ProcessedReview {
  review_id: string;
  original_text: string;
  clean_text: string;
  rating: number | null;
  timestamp: string;
  source: string;
}

export interface AIOutput {
  review_id: string;
  aspects: string[];
  aspect_sentiment: Record<string, string>;
  emotion: string;
  keywords: string[];
  rating: number | null;
  timestamp: string;
  source: string;
}

export interface FeatureStats {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface Alert {
  priority: string;
  feature: string;
  message: string;
  reason: string;
}

export interface Action {
  priority: string;
  feature: string;
  action: string;
  reason: string;
}

export interface TrendDay {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface SpikeInfo {
  day: string;
  current: number;
  avg: string;
}

export interface Directive {
  type: string;
  text: string;
  reason: string;
}

export interface RiskItem {
  feature: string;
  velocity: number;
  volume: number;
}
