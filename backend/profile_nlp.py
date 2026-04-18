import time
import re
from typing import List

CONTRACTIONS = {
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
}

def expand_contractions_v1(text: str) -> str:
    for c, e in CONTRACTIONS.items():
        text = re.sub(rf"\b{re.escape(c)}\b", e, text, flags=re.I)
    return text

# Optimized version
CONTRACTION_RE = re.compile(rf"\b({'|'.join(re.escape(c) for c in CONTRACTIONS.keys())})\b", flags=re.I)
def expand_contractions_v2(text: str) -> str:
    def replace(match):
        return CONTRACTIONS.get(match.group(0).lower(), match.group(0))
    return CONTRACTION_RE.sub(replace, text)

# Mock reviews
text = "I don't know why it's so slow. She'll be happy if it isn't lagging. We're waiting for the update, but it hasn't arrived. They'd never seen such a bad battery. Can't believe it!"
reviews = [text] * 1000

print(f"Testing with {len(reviews)} reviews...")

start = time.time()
for r in reviews:
    expand_contractions_v1(r)
print(f"V1 (Current): {time.time() - start:.4f}s")

start = time.time()
for r in reviews:
    expand_contractions_v2(r)
print(f"V2 (Optimized): {time.time() - start:.4f}s")

# Test langdetect
try:
    from langdetect import detect
    start = time.time()
    for r in reviews[:100]: # only 100 because it's slow
        detect(r)
    print(f"Langdetect (100 reviews): {time.time() - start:.4f}s")
    print(f"Langdetect projected (1000 reviews): {(time.time() - start)*10:.4f}s")
except ImportError:
    print("langdetect not installed")
