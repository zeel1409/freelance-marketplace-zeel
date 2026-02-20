import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gigsApi } from '../lib/api';
import { Plus, DollarSign, Clock } from 'lucide-react';

interface CreateGigProps {
  onBack: () => void;
  onGigCreated: () => void;
}

export default function CreateGig({ onBack, onGigCreated }: CreateGigProps) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Design', 'Development', 'Writing', 'Marketing', 'Business', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await gigsApi.create({
        title,
        description,
        category,
        price,
        delivery_days: deliveryDays,
        image_url: imageUrl || undefined,
      });
      onGigCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <p className="text-gray-700 mb-4">Only freelancers can create gigs.</p>
          <button onClick={onBack} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Gig</h1>
            <p className="text-gray-600">Share your skills and services with potential clients</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Gig Title</label>
              <input
                id="title" type="text" value={title}
                onChange={(e) => setTitle(e.target.value)} required
                placeholder="I will create a professional website for your business"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                id="description" value={description}
                onChange={(e) => setDescription(e.target.value)} required rows={6}
                placeholder="Describe your service in detail. What will you deliver? What makes you the best choice?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  id="category" value={category}
                  onChange={(e) => setCategory(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  id="imageUrl" type="url" value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="price" type="number" step="0.01" min="1" value={price}
                    onChange={(e) => setPrice(e.target.value)} required placeholder="50.00"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deliveryDays" className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (Days)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="deliveryDays" type="number" min="1" value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)} required placeholder="7"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus className="h-5 w-5" />
                <span>{loading ? 'Creating...' : 'Create Gig'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
