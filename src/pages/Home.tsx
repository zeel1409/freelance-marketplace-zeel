import { useState, useEffect, useCallback } from 'react';
import { gigsApi, Gig } from '../lib/api';
import GigCard from '../components/gigs/GigCard';
import GigDetail from '../components/gigs/GigDetail';
import { Search } from 'lucide-react';

export default function Home() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Design', 'Development', 'Writing', 'Marketing', 'Business', 'Other'];

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    try {
      const { gigs: data } = await gigsApi.list({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      setGigs(data);
    } catch (err) {
      console.error('Error fetching gigs:', err);
    }
    setLoading(false);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(fetchGigs, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchGigs]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Find the Perfect Freelance Service
          </h1>
          <p className="text-xl text-center text-blue-100 mb-8">
            Browse thousands of services from talented freelancers
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for services..."
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading gigs...</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No gigs found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} onClick={() => setSelectedGig(gig)} />
            ))}
          </div>
        )}
      </div>

      {selectedGig && (
        <GigDetail
          gig={selectedGig}
          onClose={() => setSelectedGig(null)}
          onOrderCreated={() => {
            setSelectedGig(null);
            fetchGigs();
          }}
        />
      )}
    </div>
  );
}
