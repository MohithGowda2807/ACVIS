import { useAppStore } from '@/store/appStore';
import { Star } from 'lucide-react';

export default function MyReviews() {
  const { userReviews } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Amazon Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 px-2">
        <span className="text-amazon-link hover:underline hover:text-amazon-warning cursor-pointer">Your Account</span> 
        {' > '} 
        <span className="text-gray-900 font-bold">Your Orders & Reviews</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-200">Your Reviews</h1>

        {userReviews.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p>You haven't reviewed any products yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {userReviews.map((r, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                      Product
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-amazon-link hover:text-amazon-warning hover:underline cursor-pointer">
                        Samsung Galaxy S26 Ultra, Unlocked Android Smartphone
                      </h3>
                      <div className="text-xs text-gray-500 mt-1">
                        Reviewed on {new Date(r.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] font-bold text-amazon-orange mt-1">Verified Purchase</div>
                    </div>
                  </div>
                  <button className="text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-3 py-1 shadow-sm">
                    Edit review
                  </button>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-amazon-starFill">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= (r.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="font-bold text-sm ml-2">
                    {r.text.split(' ').slice(0, 5).join(' ')}...
                  </span>
                </div>
                
                <p className="text-sm text-gray-800 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
