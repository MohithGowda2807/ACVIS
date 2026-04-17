import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { capitalize } from '@/lib/utils';
import { Star, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function ProductInsights() {
  const { featureSentiment, predictions, rawReviews } = useAppStore();
  const entries = Object.entries(featureSentiment).filter(([f]) => f !== 'general').sort((a, b) => b[1].total - a[1].total);

  if (entries.length === 0) {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto rounded-lg mt-8 text-center border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Customer reviews</h1>
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  // Calculate percentages for the 5-star bar chart based on predictions (simulated for UI)
  const total = rawReviews.length || 1;
  const ratingDist = {
    5: Math.max(0, Math.round(total * (predictions.current / 5) * 0.7)),
    4: Math.max(0, Math.round(total * (predictions.current / 5) * 0.2)),
    3: Math.max(0, Math.round(total * 0.05)),
    2: Math.max(0, Math.round(total * 0.03)),
    1: Math.max(0, Math.round(total * 0.02)),
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Amazon Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4 px-2">
        Electronics &gt; Cell Phones & Accessories &gt; Cell Phones &gt; <span className="text-gray-900 font-bold">Customer Reviews</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Rating Summary (Amazon Style) */}
        <div className="w-full md:w-[300px] shrink-0">
          <h2 className="text-2xl font-bold mb-2">Customer reviews</h2>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-amazon-starFill">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-5 h-5 ${s <= Math.round(predictions.current) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-lg font-bold">{predictions.current.toFixed(1)} out of 5</span>
          </div>
          
          <div className="text-sm text-gray-500 mb-6">
            {total} global ratings
          </div>

          {/* Amazon Star Bars */}
          <div className="space-y-3 mb-8">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = ratingDist[stars as keyof typeof ratingDist];
              const pct = Math.round((count / total) * 100);
              return (
                <div key={stars} className="flex items-center text-sm">
                  <span className="w-16 text-amazon-link hover:text-amazon-warning cursor-pointer hover:underline">{stars} star</span>
                  <div className="flex-1 h-5 mx-3 bg-gray-200 rounded overflow-hidden border border-gray-300">
                    <div className="h-full bg-amazon-yellow" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-amazon-link hover:text-amazon-warning cursor-pointer hover:underline">{pct}%</span>
                </div>
              );
            })}
          </div>

          <hr className="my-6 border-gray-300" />
          
          <h3 className="font-bold text-lg mb-2">Review this product</h3>
          <p className="text-sm mb-4">Share your thoughts with other customers</p>
          <button className="w-full btn-amazon py-1.5 text-center block">Write a customer review</button>
        </div>

        {/* Right Column: AI Insights & Features */}
        <div className="flex-1">
          {/* Amazon AI Insights Box */}
          <div className="border border-gray-300 rounded-lg p-5 mb-8 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold">Customers say</span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-200 font-bold">AI-Generated</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Based on the analysis of {total} reviews, customers appreciate the <span className="font-bold">camera quality</span> and <span className="font-bold">performance</span>, 
              noting significant improvements. However, mixed opinions remain regarding the <span className="font-bold">battery life</span> and the newly introduced <span className="font-bold">UI changes</span>. 
              The overall sentiment trend is currently <span className={`font-bold ${predictions.trend === 'improving' ? 'text-green-700' : predictions.trend === 'declining' ? 'text-red-700' : ''}`}>{predictions.trend}</span>.
            </p>
            
            {/* Feature tags */}
            <div className="flex flex-wrap gap-2">
              {entries.map(([f, s]) => {
                const isPositive = s.positive > s.negative;
                return (
                  <span key={f} className={`px-3 py-1.5 rounded-lg text-sm border cursor-pointer hover:bg-gray-50 ${
                    isPositive ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'
                  }`}>
                    {capitalize(f)} 
                    {isPositive ? <ThumbsUp className="w-3 h-3 inline ml-1 text-green-700" /> : <ThumbsDown className="w-3 h-3 inline ml-1 text-red-700" />}
                  </span>
                )
              })}
            </div>
          </div>

          <h3 className="font-bold text-xl mb-4">Top reviews from the United States</h3>
          
          {/* Sample Amazon-style Reviews */}
          <div className="space-y-6">
            {rawReviews.slice(0, 5).map((r, i) => (
              <div key={i} className="border-b border-gray-200 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    {r.user_id?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="font-sm">{r.user_id || 'Amazon Customer'}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-amazon-starFill">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= (r.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="font-bold text-sm text-amazon-link hover:text-amazon-warning hover:underline cursor-pointer">
                    {r.text.split(' ').slice(0, 5).join(' ')}...
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-2">
                  Reviewed in the United States on {new Date(r.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}
                </div>
                
                <div className="text-xs font-bold text-amazon-orange mb-2">Verified Purchase</div>
                
                <p className="text-sm leading-relaxed mb-4">{r.text}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="border border-gray-300 rounded-full px-4 py-1 hover:bg-gray-50">Helpful</button>
                  <span className="border-l border-gray-300 pl-4 cursor-pointer hover:underline text-amazon-link">Report</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
