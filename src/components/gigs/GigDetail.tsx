import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ordersApi, Gig, Review } from '../../lib/api';
import { X, Clock, User, Star, ShoppingCart } from 'lucide-react';

interface GigDetailProps {
  gig: Gig & { reviews?: Review[] };
  onClose: () => void;
  onOrderCreated: () => void;
}

export default function GigDetail({ gig, onClose, onOrderCreated }: GigDetailProps) {
  const { profile } = useAuth();
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reviews = gig.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handlePurchase = async () => {
    if (!profile || profile.role !== 'client') {
      setError('Only clients can purchase gigs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ordersApi.create({ gig_id: gig.id, requirements: requirements || undefined });
      onOrderCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Gig Details</h2>
          <button onClick={onClose} type="button" title="Close details" className="text-gray-500 hover:text-gray-700 transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                {gig.image_url ? (
                  <img src={gig.image_url} alt={gig.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-8xl text-blue-300">{gig.title.charAt(0).toUpperCase()}</div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {gig.category}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{gig.title}</h1>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {gig.profiles?.full_name || 'Freelancer'}
                      </div>
                      <div className="text-xs text-gray-500">Professional Freelancer</div>
                    </div>
                  </div>

                  {avgRating ? (
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(parseFloat(avgRating)) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        {avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No reviews yet</span>
                  )}
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Gig</h3>
                  <p className="text-gray-700 whitespace-pre-line">{gig.description}</p>
                </div>
              </div>

              {/* Real Reviews Section */}
              {reviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-4 w-4 ${s <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {review.client?.full_name || 'Client'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && <p className="text-gray-700 text-sm">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700">Price</span>
                    <span className="text-3xl font-bold text-gray-900">
                      ${(gig.price / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <Clock className="h-5 w-5" />
                    <span>{gig.delivery_days} day delivery</span>
                  </div>
                </div>

                {profile?.role === 'client' && profile.id !== gig.freelancer_id && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requirements (Optional)
                      </label>
                      <textarea
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        rows={4}
                        placeholder="Describe what you need..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
                    )}

                    <button
                      onClick={handlePurchase}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>{loading ? 'Processing...' : 'Order Now'}</span>
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      Your order will be placed and the freelancer will be notified
                    </p>
                  </div>
                )}

                {profile?.id === gig.freelancer_id && (
                  <div className="text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                    This is your gig
                  </div>
                )}

                {profile?.role === 'freelancer' && profile.id !== gig.freelancer_id && (
                  <div className="text-center text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg">
                    Only clients can purchase gigs
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
