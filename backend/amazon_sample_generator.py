"""
Generate a realistic Amazon Reviews 2023 sample dataset for ACVIS demo.
Schema matches: https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023
Category: Electronics (Cell Phones & Accessories)

Run once: python amazon_sample_generator.py
"""
import json
import random
import uuid
from datetime import datetime, timedelta

# Realistic review templates organized by aspect and sentiment
REVIEW_TEMPLATES = {
    "battery_negative": [
        "Battery drains way too fast. Can barely last half a day with normal usage.",
        "After the latest update, battery life has become terrible. Phone dies by noon.",
        "Charging takes forever and the battery drains like crazy. Very disappointed.",
        "Battery backup is pathetic. I have to charge this phone 3 times a day now.",
        "The battery performance has degraded significantly after just 2 months of use.",
        "Battery drain is insane since the firmware update. Goes from 100 to 20 in 3 hours.",
        "Worst battery life I've ever experienced on any phone. Cannot recommend.",
        "Power consumption is way too high. Battery can't keep up with basic tasks.",
        "My phone battery is dead by lunchtime. This is unacceptable for the price.",
        "Battery overheats during charging and drains unusually fast. Very concerning.",
        "The standby battery drain is ridiculous. Loses 30% overnight doing nothing.",
        "After the v2.1 update, battery went from amazing to completely unusable.",
        "Can't even get through a workday without carrying a power bank. Battery is trash.",
        "Battery health dropped to 85% in just 3 months. Terrible longevity.",
        "Fast charging doesn't work properly and the battery percentage jumps around.",
    ],
    "battery_positive": [
        "Battery life is incredible! Easily lasts a full day with heavy usage.",
        "Amazing battery backup. I get 2 days of moderate use on a single charge.",
        "The 5000mAh battery is a beast. Best battery life I've had on any phone.",
        "Charging is super fast - 0 to 100 in under an hour. Battery lasts all day.",
        "Battery optimization is excellent. Standby drain is minimal.",
        "Great battery life for gaming. Can play for 5-6 hours straight.",
        "The battery easily handles a full day of heavy use including camera and GPS.",
        "Best battery life in this price range. Absolutely no complaints.",
    ],
    "camera_negative": [
        "Camera quality is disappointing. Photos look blurry and washed out.",
        "Night mode is terrible. Photos are grainy and lack detail in low light.",
        "The camera app crashes frequently. Can't rely on it for important shots.",
        "Video stabilization is non-existent. All my videos come out shaky.",
        "Camera lens has a weird haze effect. Colors look unnatural.",
        "Selfie camera is mediocre at best. Poor skin tone accuracy.",
        "Camera struggles in anything but perfect lighting conditions.",
        "Photo processing takes too long. Miss many spontaneous moments.",
        "Camera zoom is useless beyond 2x. Everything becomes pixelated.",
        "The camera app has too many bugs since the last update. Very frustrating.",
    ],
    "camera_positive": [
        "Camera quality is stunning! Portrait mode creates beautiful bokeh effects.",
        "Night mode is impressive. Captures so much detail in low light conditions.",
        "Best camera I've used on a phone. Professional quality photos every time.",
        "The 108MP camera takes incredibly sharp and detailed photos.",
        "Video recording at 4K is smooth and colors are very accurate.",
        "Selfie camera is excellent. Great for video calls and social media.",
        "Camera zoom is surprisingly good. Even 10x zoom produces usable photos.",
        "The camera consistently impresses me. Best feature of this phone.",
        "AI scene detection works perfectly. Always picks the right settings.",
        "Camera is the main reason I bought this phone and it does not disappoint.",
        "Portrait mode on this phone rivals my dedicated DSLR camera.",
        "Night photography is exceptional. Stars are clearly visible in photos.",
    ],
    "display_negative": [
        "Screen brightness is too low for outdoor use. Can barely see anything in sunlight.",
        "Display has dead pixels after just one month. Quality control is poor.",
        "The screen flickers at low brightness. Hurts my eyes during nighttime use.",
        "Color accuracy is way off. Everything looks oversaturated and unnatural.",
        "Screen protector doesn't adhere properly due to curved edges.",
        "Display scratches very easily despite the gorilla glass claims.",
    ],
    "display_positive": [
        "The AMOLED display is absolutely gorgeous. Colors pop and blacks are deep.",
        "120Hz refresh rate makes everything feel incredibly smooth and responsive.",
        "Display brightness is excellent. Can easily see the screen in direct sunlight.",
        "Screen quality is top-notch. Perfect for watching videos and gaming.",
        "HDR10+ support makes streaming content look amazing on this display.",
        "The display resolution is sharp and crisp. Text is very clear to read.",
        "Best display I've seen on a phone. Colors are accurate and viewing angles are great.",
        "Screen size is perfect. Not too big, not too small. Great for one-handed use.",
    ],
    "performance_negative": [
        "Phone lags horribly when switching between apps. Very frustrating experience.",
        "Performance has degraded significantly after the latest software update.",
        "Games stutter and frame rate drops are constant. Not good for gaming.",
        "The phone freezes randomly and I have to restart it multiple times a day.",
        "App loading times are unacceptably slow for a phone at this price point.",
        "Multitasking is painful. Apps constantly reload when switching back to them.",
        "Phone becomes sluggish after a few hours of use. Needs frequent restarts.",
        "RAM management is terrible. Background apps get killed constantly.",
        "The processor throttles aggressively during gaming. Performance tanks after 10 min.",
        "Boot time is way too long. Takes over a minute to start up.",
    ],
    "performance_positive": [
        "Blazing fast performance! The Snapdragon chip handles everything I throw at it.",
        "Smooth and responsive. No lag whatsoever even with heavy multitasking.",
        "Gaming performance is excellent. Runs all games at max settings without issues.",
        "App switching is instantaneous. Best performance I've experienced on a phone.",
        "The processor handles demanding tasks effortlessly. Very impressed.",
        "Performance is consistently smooth even after months of use. No degradation.",
        "Fast and responsive. This phone never slows down or stutters.",
        "12GB RAM makes multitasking a breeze. Apps stay in memory perfectly.",
    ],
    "software_negative": [
        "Too much bloatware. Comes with dozens of pre-installed apps I can't remove.",
        "Software updates break more things than they fix. Very unstable OS.",
        "The UI is cluttered with ads. Even the settings menu shows advertisements.",
        "Bugs everywhere after the latest update. Phone crashes randomly.",
        "Software is not optimized at all. Simple tasks consume too much resources.",
        "The OS feels unpolished. Many UI elements are inconsistent.",
        "Haven't received a security update in months. Feels abandoned.",
        "Notification system is broken. Messages arrive late or not at all.",
        "The app store has too many fake apps. Security feels compromised.",
        "Custom skin over Android is bloated and slow. Prefer stock Android.",
    ],
    "software_positive": [
        "Software is clean and well-optimized. Smooth experience overall.",
        "Regular monthly security updates. Good software support.",
        "The UI is intuitive and easy to navigate. Great user experience.",
        "No bloatware at all. Clean Android experience out of the box.",
        "Software features are thoughtful and actually useful. Not gimmicky.",
        "The custom launcher is beautiful and customizable. Love the themes.",
    ],
    "ui_negative": [
        "The user interface is confusing. Takes forever to find basic settings.",
        "UI design feels outdated compared to competitors. Needs a refresh.",
        "Navigation gestures don't work reliably. Frustrating to use.",
        "The interface is cluttered with too many options. Overwhelming.",
        "Dark mode has issues. Some apps don't render properly in dark theme.",
        "Menu layout is unintuitive. Basic features are buried in sub-menus.",
    ],
    "ui_positive": [
        "UI is beautiful and modern. Love the clean design language.",
        "Interface is very intuitive. Everything is where you'd expect it to be.",
        "The new One UI update is fantastic. Smooth animations everywhere.",
        "Navigation is seamless. Gesture controls work perfectly.",
        "Dark mode looks gorgeous. Easy on the eyes during nighttime use.",
        "Customization options are excellent. Can personalize everything.",
    ],
    "price_negative": [
        "Way overpriced for what you get. Better options available for less money.",
        "Not worth the premium price tag. Missing features that cheaper phones have.",
        "Price keeps increasing with each generation but quality stays the same.",
        "Feels like paying a premium for the brand name only. Disappointing value.",
        "At this price point, I expected much better build quality and features.",
    ],
    "price_positive": [
        "Amazing value for money! Gets you flagship features at mid-range price.",
        "Best phone you can buy at this price point. Incredible deal.",
        "Worth every penny. The features and quality justify the price.",
        "Great budget option that doesn't compromise on essential features.",
        "Unbeatable value. Camera and performance rival phones twice the price.",
        "This phone punches way above its price range. Highly recommended.",
    ],
    "audio_negative": [
        "Speaker quality is tinny and lacks bass. Very disappointing audio.",
        "No headphone jack is a dealbreaker. The USB-C adapter is inconvenient.",
        "Call quality is poor. The other person always complains about my mic.",
        "Speaker distorts at high volumes. Can't enjoy music on this phone.",
    ],
    "audio_positive": [
        "Dual stereo speakers sound amazing. Great for watching videos and music.",
        "Audio quality is impressive. Dolby Atmos support makes a real difference.",
        "Call quality is crystal clear. Both speakers and microphone work great.",
        "The headphone jack is a welcome addition. Audio output is clean.",
    ],
    "heating_negative": [
        "Phone overheats badly during gaming. Gets too hot to hold comfortably.",
        "Excessive heating during charging. Concerned about long-term safety.",
        "Thermal management is poor. Phone heats up even with basic tasks.",
        "The phone becomes a hand warmer after 30 minutes of camera use.",
        "Overheating causes performance throttling. Gaming experience suffers.",
        "Gets uncomfortably warm during video calls. Needs better heat dissipation.",
    ],
    "durability_negative": [
        "Build quality feels cheap and plasticky. Not premium at all.",
        "Phone cracked on the first drop despite having gorilla glass.",
        "The back panel scratches way too easily. Looks worn after a week.",
        "Buttons feel loose and wobbly. Doesn't inspire confidence in build quality.",
    ],
    "durability_positive": [
        "Build quality is premium. Metal frame and glass back feel solid.",
        "Dropped it several times and not a scratch. Very durable build.",
        "IP68 water resistance actually works. Survived an accidental pool dip.",
        "The build quality is exceptional. Feels like a much more expensive phone.",
    ],
    "support_negative": [
        "Customer support is terrible. Waited 3 weeks for a response to my ticket.",
        "Service center experience was awful. They didn't fix the issue properly.",
        "Warranty claim was rejected for no valid reason. Very poor customer service.",
        "Can't reach customer support. Phone lines always busy, chat bot is useless.",
        "Support team is unresponsive and unhelpful. No solution after multiple contacts.",
    ],
    "connectivity_negative": [
        "WiFi keeps disconnecting randomly. Very unreliable network connectivity.",
        "Bluetooth connection drops frequently. Can't use wireless earbuds reliably.",
        "5G reception is poor. Falls back to 4G constantly even in covered areas.",
        "GPS accuracy is terrible. Navigation apps show wrong location frequently.",
    ],
    "connectivity_positive": [
        "5G speeds are incredible. Downloads are almost instantaneous.",
        "WiFi 6 support works great. Fastest WiFi speeds I've had on a phone.",
        "Bluetooth 5.3 connectivity is rock solid. No drops or latency issues.",
        "GPS locks on fast and is very accurate. Perfect for navigation.",
    ],
    "fingerprint_negative": [
        "Fingerprint sensor is slow and unreliable. Fails to recognize my finger half the time.",
        "Face unlock doesn't work in low light. Very inconsistent biometric security.",
        "The in-display fingerprint reader is poorly positioned. Hard to find by feel.",
    ],
    "fingerprint_positive": [
        "Fingerprint sensor is blazing fast. Unlocks instantly every time.",
        "Face unlock is incredibly quick and works well even in dim lighting.",
        "Under-display fingerprint is responsive and accurate. Never fails.",
    ],
    "storage_positive": [
        "256GB storage is more than enough. Never have to worry about space.",
        "Expandable storage via microSD is a huge plus. Can add more space easily.",
    ],
    "general_positive": [
        "Overall an excellent phone. Very happy with my purchase.",
        "This phone exceeded all my expectations. Best purchase this year.",
        "Highly recommend this phone to anyone looking for a reliable device.",
        "Perfect phone for daily use. Does everything well without any issues.",
        "Great all-around device. No major complaints after 3 months of use.",
        "Loving this phone! It checks all the boxes for me.",
        "Solid phone with great features. Would buy again without hesitation.",
        "Best phone I've owned. The complete package at a great price.",
    ],
    "general_negative": [
        "Worst phone I've ever owned. Regret this purchase completely.",
        "Returning this phone. Too many issues to list. Total waste of money.",
        "Do not buy this phone. Problems from day one and no customer support.",
        "Extremely disappointed with this phone. Nothing works as advertised.",
        "This phone is a scam. Quality is nowhere near what they promised.",
    ],
    "delivery_positive": [
        "Delivery was super fast. Got it the next day in perfect packaging.",
        "Amazon Prime delivery was quick. Phone arrived in excellent condition.",
        "Fast shipping and great packaging. Phone was well protected.",
    ],
    "delivery_negative": [
        "Package arrived damaged. The box was crushed and phone had scratches.",
        "Delivery took 2 weeks longer than promised. Very poor shipping experience.",
        "Received a used phone instead of new. Clearly had fingerprints and scratches.",
    ],
    "sarcasm": [
        "Great, another update that crashes my phone. Thanks for nothing.",
        "Love how the battery dies right when I need it most. Perfect timing.",
        "Amazing how fast this phone overheats. Must be a feature, not a bug.",
        "Wow, the camera app only crashes 5 times a day now. What an improvement.",
        "Fantastic lag every time I open the camera. Really love waiting.",
        "Perfect phone if you enjoy charging it every 3 hours. Just wonderful.",
        "Best joke of 2024 is calling this phone 'flagship'. Good one.",
    ],
    "mixed": [
        "Camera is great but the battery life is terrible. Mixed feelings overall.",
        "Love the display but the software is buggy. Needs work.",
        "Performance is smooth but the phone overheats during gaming.",
        "Great value for money but the camera could be much better.",
        "Battery is excellent but the UI feels outdated and clunky.",
        "Good phone overall but the speaker quality is really disappointing.",
        "Display is gorgeous but build quality feels cheap for the price.",
        "Camera zoom is impressive but night mode needs significant improvement.",
        "Fast charging is great but the battery capacity should be bigger.",
        "Software is clean but missing some features that competitors offer.",
        "Fingerprint sensor is fast but face unlock is unreliable in low light.",
        "The phone is lightweight but feels fragile. Worried about durability.",
    ],
}

# Product ASINs (fake but realistic)
PRODUCTS = [
    "B0BSHF7WHJ", "B0C9J7LCXV", "B0CDQWM2T3", "B0BN93XTKL",
    "B0BNHKDQ2G", "B0CDQD57ZP", "B0BZ6KK3MQ", "B0BTHW8LPX",
]

def generate_sample(num_reviews=500):
    reviews = []
    # Create a 14-day date spread with an intentional spike on days 7-10
    base_date = datetime(2024, 3, 1)

    # Weight distribution: more negative battery/software after day 7 (simulating bad update)
    all_keys = list(REVIEW_TEMPLATES.keys())

    for i in range(num_reviews):
        # Determine day (0-13) with some clustering
        if i < 150:      # Days 1-4: normal distribution
            day_offset = random.randint(0, 3)
        elif i < 350:     # Days 5-10: spike period
            day_offset = random.randint(4, 9)
        else:             # Days 11-14: partial recovery
            day_offset = random.randint(10, 13)

        ts = base_date + timedelta(
            days=day_offset,
            hours=random.randint(6, 23),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59),
        )

        # During spike period, weight heavily toward negative battery/software
        if 4 <= day_offset <= 9 and random.random() < 0.45:
            key = random.choice(["battery_negative", "software_negative", "heating_negative", "performance_negative", "sarcasm"])
        else:
            key = random.choice(all_keys)

        templates = REVIEW_TEMPLATES[key]
        text = random.choice(templates)

        # Assign rating based on sentiment
        if "negative" in key or key == "sarcasm":
            rating = random.choice([1, 1, 1, 2, 2])
        elif "positive" in key:
            rating = random.choice([4, 4, 5, 5, 5])
        else:  # mixed
            rating = random.choice([2, 3, 3, 3, 4])

        review = {
            "rating": float(rating),
            "title": text[:60].rsplit(" ", 1)[0] + "...",
            "text": text,
            "parent_asin": random.choice(PRODUCTS),
            "user_id": f"A{random.randint(10000000, 99999999)}",
            "timestamp": int(ts.timestamp() * 1000),
            "helpful_vote": random.randint(0, 50),
            "verified_purchase": random.random() > 0.15,
        }
        reviews.append(review)

    random.shuffle(reviews)
    return reviews


if __name__ == "__main__":
    import os
    random.seed(42)
    data = generate_sample(500)
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "amazon_reviews_sample.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[OK] Generated {len(data)} reviews -> {out_path}")
