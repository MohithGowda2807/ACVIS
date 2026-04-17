// ============================================================
// ACVIS — Data Layer
// Sample reviews, configuration, and mappings
// ============================================================

const KNOWN_ASPECTS = [
  "battery", "camera", "performance", "ui", "price",
  "display", "storage", "charging", "speaker", "design",
  "software", "security", "durability", "connectivity", "support"
];

const ASPECT_ALIASES = {
  "battery life": "battery", "bat": "battery", "charge": "charging",
  "cam": "camera", "photo": "camera", "photos": "camera", "picture": "camera", "pictures": "camera", "video": "camera",
  "speed": "performance", "fast": "performance", "slow": "performance", "lag": "performance", "laggy": "performance", "hang": "performance", "crash": "performance", "crashes": "performance", "fps": "performance", "ram": "performance",
  "screen": "display", "resolution": "display", "brightness": "display", "oled": "display", "amoled": "display",
  "interface": "ui", "menu": "ui", "navigation": "ui", "layout": "ui", "ux": "ui", "app": "ui",
  "cost": "price", "expensive": "price", "cheap": "price", "value": "price", "money": "price", "worth": "price",
  "space": "storage", "memory": "storage", "gb": "storage",
  "audio": "speaker", "sound": "speaker", "volume": "speaker", "mic": "speaker", "microphone": "speaker",
  "look": "design", "build": "design", "color": "design", "weight": "design", "slim": "design",
  "update": "software", "os": "software", "android": "software", "ios": "software", "firmware": "software", "bug": "software", "bugs": "software",
  "fingerprint": "security", "face id": "security", "lock": "security", "privacy": "security",
  "wifi": "connectivity", "bluetooth": "connectivity", "5g": "connectivity", "signal": "connectivity", "network": "connectivity", "gps": "connectivity",
  "service": "support", "warranty": "support", "customer service": "support", "help": "support"
};

const POSITIVE_WORDS = [
  "great", "amazing", "excellent", "awesome", "fantastic", "love", "perfect",
  "best", "wonderful", "brilliant", "outstanding", "superb", "good", "nice",
  "impressive", "beautiful", "smooth", "fast", "crisp", "clear", "solid",
  "reliable", "stunning", "phenomenal", "incredible", "top-notch", "premium",
  "exceptional", "flawless", "sleek", "powerful", "responsive", "sharp",
  "vibrant", "comfortable", "durable", "worth", "recommend", "satisfied",
  "improved", "better", "upgrade", "enjoy", "happy", "pleased", "delight"
];

const NEGATIVE_WORDS = [
  "bad", "terrible", "awful", "horrible", "worst", "hate", "poor",
  "slow", "lag", "laggy", "crash", "crashes", "broke", "broken",
  "disappointing", "useless", "waste", "overpriced", "cheap", "flimsy",
  "dim", "blurry", "ugly", "frustrating", "annoying", "drain", "drains",
  "overheat", "overheats", "heavy", "bulky", "glitch", "glitchy",
  "expensive", "fails", "fail", "died", "dead", "defective", "sucks",
  "worse", "downgrade", "regret", "unhappy", "dissatisfied", "mediocre",
  "fragile", "pathetic", "nightmare", "garbage", "trash", "junk"
];

const SARCASM_PATTERNS = [
  { pattern: /great.*(crash|die|broke|fail|problem)/i, flip: true },
  { pattern: /love.*(wait|lag|slow|crash|freeze)/i, flip: true },
  { pattern: /amazing.*(how|bad|terrible|awful)/i, flip: true },
  { pattern: /nice.*(crash|bug|problem|issue)/i, flip: true },
  { pattern: /wonderful.*(experience|time).*(crash|lag|slow)/i, flip: true },
  { pattern: /thanks.*(nothing|crash|bug|break)/i, flip: true },
  { pattern: /🙄|😤|😡|💀/i, flip: true }
];

const CONTRACTIONS = {
  "can't": "cannot", "won't": "will not", "don't": "do not",
  "doesn't": "does not", "didn't": "did not", "isn't": "is not",
  "aren't": "are not", "wasn't": "was not", "weren't": "were not",
  "haven't": "have not", "hasn't": "has not", "hadn't": "had not",
  "wouldn't": "would not", "shouldn't": "should not", "couldn't": "could not",
  "i'm": "i am", "you're": "you are", "they're": "they are",
  "we're": "we are", "it's": "it is", "that's": "that is",
  "there's": "there is", "here's": "here is", "what's": "what is",
  "who's": "who is", "i've": "i have", "you've": "you have",
  "we've": "we have", "they've": "they have", "i'll": "i will",
  "you'll": "you will", "he'll": "he will", "she'll": "she will",
  "we'll": "we will", "they'll": "they will", "i'd": "i would",
  "you'd": "you would", "he'd": "he would", "she'd": "she would",
  "we'd": "we would", "they'd": "they would"
};

const SLANG_MAP = {
  "btw": "by the way", "lol": "laughing", "tbh": "to be honest",
  "imo": "in my opinion", "smh": "shaking my head", "ngl": "not going to lie",
  "fr": "for real", "rn": "right now", "tho": "though", "bc": "because",
  "idk": "i do not know", "nvm": "never mind", "ikr": "i know right",
  "omg": "oh my god", "af": "as fuck", "fyi": "for your information",
  "goat": "greatest of all time", "lit": "amazing", "fire": "amazing",
  "sick": "amazing", "dope": "amazing", "mid": "mediocre", "sus": "suspicious",
  "lowkey": "somewhat", "highkey": "very", "deadass": "seriously"
};

const EMOTION_KEYWORDS = {
  anger: ["furious", "outraged", "angry", "mad", "livid", "hate", "worst", "terrible", "garbage", "trash", "scam", "fraud", "rip off", "unacceptable"],
  frustration: ["frustrating", "annoying", "disappointed", "struggle", "difficult", "confusing", "headache", "pain", "hassle", "fed up", "sick of", "tired of", "give up"],
  satisfaction: ["love", "happy", "satisfied", "pleased", "delighted", "enjoy", "perfect", "excellent", "recommend", "best", "awesome", "fantastic", "amazing", "grateful"],
  neutral: []
};

const ROOT_CAUSE_KEYWORDS = {
  "update": "Recent software update",
  "v2": "Version 2.x update",
  "v3": "Version 3.x update",
  "new version": "Latest version release",
  "latest update": "Most recent update",
  "after update": "Post-update regression",
  "since update": "Post-update regression",
  "firmware": "Firmware change",
  "patch": "Recent patch",
  "release": "New release"
};

const THRESHOLDS = {
  high_negative: 0.6,
  medium_negative: 0.4,
  spike_multiplier: 2.0,
  min_volume: 3,
  positive_promote: 0.8
};

// 55 sample reviews spanning 7 days with realistic distribution
const SAMPLE_REVIEWS = [
  // Day 1 — 2026-04-10
  { review_id: "R001", text: "Battery drains too fast after the latest update. Camera is amazing though!", rating: 3, timestamp: "2026-04-10T08:30:00Z", source: "playstore" },
  { review_id: "R002", text: "Love the camera quality, photos are crisp and vibrant. Best phone camera I've used.", rating: 5, timestamp: "2026-04-10T09:15:00Z", source: "amazon" },
  { review_id: "R003", text: "UI is smooth and responsive. Great design overall.", rating: 4, timestamp: "2026-04-10T10:00:00Z", source: "playstore" },
  { review_id: "R004", text: "Price is too high for what you get. Performance is decent but nothing special.", rating: 3, timestamp: "2026-04-10T11:30:00Z", source: "amazon" },
  { review_id: "R005", text: "Display is absolutely stunning. AMOLED panel is gorgeous.", rating: 5, timestamp: "2026-04-10T14:00:00Z", source: "twitter" },
  { review_id: "R006", text: "Battery barely lasts a day now since the firmware update. Very disappointing.", rating: 2, timestamp: "2026-04-10T15:45:00Z", source: "playstore" },
  { review_id: "R007", text: "Speaker quality is good for the price. Nice bass response.", rating: 4, timestamp: "2026-04-10T16:30:00Z", source: "amazon" },
  { review_id: "R008", text: "Charging speed is impressive, 0 to 80% in 30 minutes!", rating: 5, timestamp: "2026-04-10T18:00:00Z", source: "playstore" },

  // Day 2 — 2026-04-11
  { review_id: "R009", text: "Camera is phenomenal in low light. Night mode is the best I've seen.", rating: 5, timestamp: "2026-04-11T07:30:00Z", source: "twitter" },
  { review_id: "R010", text: "Battery is getting worse every day. Already lost 20% capacity in a month.", rating: 1, timestamp: "2026-04-11T08:45:00Z", source: "playstore" },
  { review_id: "R011", text: "Great, another crash after the update 🙄. Phone died 3 times today.", rating: 1, timestamp: "2026-04-11T09:30:00Z", source: "amazon" },
  { review_id: "R012", text: "Performance is laggy when multitasking. RAM management needs work.", rating: 2, timestamp: "2026-04-11T10:15:00Z", source: "playstore" },
  { review_id: "R013", text: "Design is sleek and premium. Love the matte finish.", rating: 5, timestamp: "2026-04-11T12:00:00Z", source: "amazon" },
  { review_id: "R014", text: "Connectivity issues with Bluetooth. Keeps disconnecting randomly.", rating: 2, timestamp: "2026-04-11T13:30:00Z", source: "playstore" },
  { review_id: "R015", text: "Storage runs out quickly even with 128GB. System takes too much space.", rating: 2, timestamp: "2026-04-11T15:00:00Z", source: "amazon" },
  { review_id: "R016", text: "Battery drain is insane! Can't even last half a day with normal use.", rating: 1, timestamp: "2026-04-11T17:00:00Z", source: "twitter" },

  // Day 3 — 2026-04-12
  { review_id: "R017", text: "Camera zoom is incredible. 10x optical zoom is crystal clear.", rating: 5, timestamp: "2026-04-12T08:00:00Z", source: "playstore" },
  { review_id: "R018", text: "Battery life has been terrible since v2.1 update. Went from great to garbage.", rating: 1, timestamp: "2026-04-12T09:00:00Z", source: "amazon" },
  { review_id: "R019", text: "This phone overheats like crazy during gaming. Performance drops badly.", rating: 1, timestamp: "2026-04-12T10:30:00Z", source: "playstore" },
  { review_id: "R020", text: "UI animations are buttery smooth. Love the new gestures.", rating: 5, timestamp: "2026-04-12T11:00:00Z", source: "amazon" },
  { review_id: "R021", text: "Battery problem again! Third phone with this issue. Unacceptable!", rating: 1, timestamp: "2026-04-12T12:30:00Z", source: "twitter" },
  { review_id: "R022", text: "Display brightness is too dim outdoors. Can barely see anything.", rating: 2, timestamp: "2026-04-12T13:45:00Z", source: "playstore" },
  { review_id: "R023", text: "Sound quality is amazing with headphones. DAC is top notch.", rating: 5, timestamp: "2026-04-12T15:00:00Z", source: "amazon" },
  { review_id: "R024", text: "Battery drains 10% per hour doing nothing. Something is very wrong since the latest update.", rating: 1, timestamp: "2026-04-12T16:30:00Z", source: "playstore" },

  // Day 4 — 2026-04-13
  { review_id: "R025", text: "Camera portrait mode is stunning. Bokeh effect looks natural.", rating: 5, timestamp: "2026-04-13T07:15:00Z", source: "twitter" },
  { review_id: "R026", text: "Battery drains so fast even in standby after the v2.1 patch. Worst update ever.", rating: 1, timestamp: "2026-04-13T08:30:00Z", source: "playstore" },
  { review_id: "R027", text: "Performance is snappy for everyday tasks. No complaints.", rating: 4, timestamp: "2026-04-13T09:45:00Z", source: "amazon" },
  { review_id: "R028", text: "5G connectivity is excellent. Downloads are blazing fast.", rating: 5, timestamp: "2026-04-13T10:30:00Z", source: "playstore" },
  { review_id: "R029", text: "My battery went from lasting all day to barely 6 hours after the latest update. Fix this!", rating: 1, timestamp: "2026-04-13T12:00:00Z", source: "amazon" },
  { review_id: "R030", text: "Security features are solid. Fingerprint is fast and reliable.", rating: 4, timestamp: "2026-04-13T13:30:00Z", source: "twitter" },
  { review_id: "R031", text: "The battery situation is a nightmare. I'm returning this phone.", rating: 1, timestamp: "2026-04-13T14:45:00Z", source: "playstore" },
  { review_id: "R032", text: "Software has too many bugs since the new release. Apps keep crashing.", rating: 1, timestamp: "2026-04-13T16:00:00Z", source: "amazon" },

  // Day 5 — 2026-04-14 (SPIKE DAY)
  { review_id: "R033", text: "Battery is dead after 4 hours. This is unacceptable for a flagship phone!", rating: 1, timestamp: "2026-04-14T07:00:00Z", source: "twitter" },
  { review_id: "R034", text: "BATTERY DRAIN IS INSANE! Went from 100% to 30% in 2 hours!!", rating: 1, timestamp: "2026-04-14T07:45:00Z", source: "playstore" },
  { review_id: "R035", text: "Another day, another battery complaint. Fix the update already!", rating: 1, timestamp: "2026-04-14T08:30:00Z", source: "amazon" },
  { review_id: "R036", text: "Camera is still excellent though. Only thing keeping me from switching.", rating: 4, timestamp: "2026-04-14T09:00:00Z", source: "playstore" },
  { review_id: "R037", text: "Battery problem is ruining this amazing phone. Please release a hotfix!", rating: 1, timestamp: "2026-04-14T09:45:00Z", source: "twitter" },
  { review_id: "R038", text: "My battery went from 80% to dead in 1 hour while just browsing. Furious!", rating: 1, timestamp: "2026-04-14T10:30:00Z", source: "playstore" },
  { review_id: "R039", text: "UI looks beautiful but the battery makes this phone unusable.", rating: 2, timestamp: "2026-04-14T11:15:00Z", source: "amazon" },
  { review_id: "R040", text: "Six battery complaints from me this week. Still no response from support.", rating: 1, timestamp: "2026-04-14T12:00:00Z", source: "playstore" },
  { review_id: "R041", text: "Performance tanked along with battery after last update. Terrible.", rating: 1, timestamp: "2026-04-14T13:30:00Z", source: "twitter" },
  { review_id: "R042", text: "Design is premium, camera is great, but BATTERY IS AWFUL since update.", rating: 2, timestamp: "2026-04-14T14:45:00Z", source: "amazon" },

  // Day 6 — 2026-04-15
  { review_id: "R043", text: "Battery still terrible. Any fix coming? This is day 5 of this issue.", rating: 1, timestamp: "2026-04-15T08:00:00Z", source: "playstore" },
  { review_id: "R044", text: "Camera video stabilization is the best in class. Smooth 4K recording.", rating: 5, timestamp: "2026-04-15T09:30:00Z", source: "amazon" },
  { review_id: "R045", text: "Love the display! Colors are so accurate and vivid.", rating: 5, timestamp: "2026-04-15T10:15:00Z", source: "twitter" },
  { review_id: "R046", text: "Charging is fast but what's the point if battery dies in 5 hours?", rating: 2, timestamp: "2026-04-15T11:00:00Z", source: "playstore" },
  { review_id: "R047", text: "Customer support is useless. Been waiting 3 days for a response about battery.", rating: 1, timestamp: "2026-04-15T12:30:00Z", source: "amazon" },
  { review_id: "R048", text: "Nice phone overall but the software needs serious optimization.", rating: 3, timestamp: "2026-04-15T14:00:00Z", source: "playstore" },

  // Day 7 — 2026-04-16
  { review_id: "R049", text: "Battery issues persist. Regret buying this phone honestly.", rating: 1, timestamp: "2026-04-16T07:30:00Z", source: "twitter" },
  { review_id: "R050", text: "Camera AI features are incredible. Scene detection and optimization is top tier.", rating: 5, timestamp: "2026-04-16T09:00:00Z", source: "playstore" },
  { review_id: "R051", text: "Performance has improved slightly with a minor patch but battery still bad.", rating: 2, timestamp: "2026-04-16T10:30:00Z", source: "amazon" },
  { review_id: "R052", text: "Display is gorgeous for media consumption. Best screen I've owned.", rating: 5, timestamp: "2026-04-16T12:00:00Z", source: "playstore" },
  { review_id: "R053", text: "Connectivity is great. WiFi 6E is noticeably faster than my old phone.", rating: 4, timestamp: "2026-04-16T13:30:00Z", source: "amazon" },
  { review_id: "R054", text: "Battery drain continues. Four stars for everything else, minus three for battery.", rating: 2, timestamp: "2026-04-16T15:00:00Z", source: "twitter" },
  { review_id: "R055", text: "Price is justified if they fix the battery. Everything else is premium quality.", rating: 3, timestamp: "2026-04-16T16:30:00Z", source: "playstore" }
];

const FEATURE_ICONS = {
  battery: "🔋", camera: "📷", performance: "⚡", ui: "🎨",
  price: "💰", display: "📱", storage: "💾", charging: "🔌",
  speaker: "🔊", design: "✨", software: "🖥️", security: "🔒",
  durability: "🛡️", connectivity: "📶", support: "🎧", general: "📋"
};

const PRIORITY_CONFIG = {
  critical: { color: "#ff3b5c", bg: "rgba(255,59,92,0.12)", icon: "🚨", label: "CRITICAL" },
  high:     { color: "#ff9f43", bg: "rgba(255,159,67,0.12)", icon: "⚠️", label: "HIGH" },
  medium:   { color: "#feca57", bg: "rgba(254,202,87,0.12)", icon: "📌", label: "MEDIUM" },
  low:      { color: "#48dbfb", bg: "rgba(72,219,251,0.12)", icon: "ℹ️", label: "LOW" }
};

export {
  KNOWN_ASPECTS, ASPECT_ALIASES, POSITIVE_WORDS, NEGATIVE_WORDS,
  SARCASM_PATTERNS, CONTRACTIONS, SLANG_MAP, EMOTION_KEYWORDS,
  ROOT_CAUSE_KEYWORDS, THRESHOLDS, SAMPLE_REVIEWS,
  FEATURE_ICONS, PRIORITY_CONFIG
};
