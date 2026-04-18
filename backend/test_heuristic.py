import time
import re

# Mock a simple English check
def is_likely_english(text: str) -> bool:
    # Quick check: 90% ASCII + contains common English words
    if not text: return False
    # Check ASCII ratio
    ascii_chars = sum(1 for c in text[:200] if ord(c) < 128)
    if ascii_chars / min(len(text), 200) < 0.9:
        return False
    
    common_words = {' the ', ' is ', ' and ', ' a ', ' to ', ' in ', ' of ', ' it '}
    text_lower = ' ' + text.lower() + ' '
    return any(word in text_lower for word in common_words)

# Test text
eng_text = "The battery is really good and the charging is fast. I love this phone."
hindi_text = "यह फोन बहुत अच्छा है और बैटरी भी काफी चलती है।"

print(f"English check (Eng): {is_likely_english(eng_text)}")
print(f"English check (Hindi): {is_likely_english(hindi_text)}")

# Benchmarking
try:
    from langdetect import detect
except:
    detect = lambda x: "en"

reps = 1000
start = time.time()
for _ in range(reps):
    is_likely_english(eng_text)
print(f"Heuristic time ({reps} reps): {time.time() - start:.4f}s")

start = time.time()
for _ in range(reps):
    detect(eng_text[:250])
print(f"Langdetect time ({reps} reps): {time.time() - start:.4f}s")
