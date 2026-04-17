import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Star } from 'lucide-react';

export default function SubmitReview() {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { submitUserReview } = useAppStore();

  const handleSubmit = () => {
    if (!text.trim() || rating === 0) return;
    submitUserReview(text, rating, 'amazon');
    setSubmitted(true);
    setTimeout(() => {
      setText('');
      setRating(0);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Amazon Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 px-2">
        <span className="text-amazon-link hover:underline hover:text-amazon-warning cursor-pointer">Your Account</span> 
        {' > '} 
        <span className="text-amazon-link hover:underline hover:text-amazon-warning cursor-pointer">Your Orders</span>
        {' > '} 
        <span className="text-gray-900 font-bold">Write a Review</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-200">Create Review</h1>

        {submitted ? (
          <div className="py-12 text-center">
            <div className="text-green-700 text-xl font-bold mb-2">✓ Review submitted.</div>
            <p className="text-sm text-gray-600">Thank you for sharing your feedback with us.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Product Summary */}
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                <span className="text-xs text-gray-400">Image</span>
              </div>
              <span className="font-bold text-sm">Samsung Galaxy S26 Ultra, Unlocked Android Smartphone, 512GB</span>
            </div>

            <hr className="border-gray-200" />

            {/* Overall Rating */}
            <div>
              <h2 className="text-lg font-bold mb-2">Overall rating</h2>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none focus:ring-2 focus:ring-amazon-orange rounded"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amazon-starFill text-amazon-starFill'
                          : 'text-gray-300 fill-transparent stroke-gray-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Written Review */}
            <div>
              <h2 className="text-lg font-bold mb-2">Add a written review</h2>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="What did you like or dislike? What did you use this product for?"
                className="w-full h-32 p-3 border border-gray-400 rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange focus:outline-none shadow-inner"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || rating === 0}
                className="btn-amazon disabled:opacity-50 disabled:cursor-not-allowed text-base px-6 py-2"
              >
                Submit
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
