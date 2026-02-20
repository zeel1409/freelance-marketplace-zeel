import { useState, useEffect } from 'react';
import { gigsApi, Gig } from '../lib/api';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface MyGigsProps {
  onCreateGig: () => void;
}

export default function MyGigs({ onCreateGig }: MyGigsProps) {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const { gigs: data } = await gigsApi.list({ freelancer: 'me' });
      setGigs(data);
    } catch (err) {
      console.error('Error fetching gigs:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const toggleStatus = async (gig: Gig) => {
    setActionLoading(gig.id);
    try {
      await gigsApi.update(gig.id, {
        status: gig.status === 'active' ? 'inactive' : 'active',
      });
      await fetchGigs();
    } catch (err) {
      console.error('Error updating gig:', err);
    }
    setActionLoading(null);
  };

  const deleteGig = async (gigId: string) => {
    if (!confirm('Are you sure you want to delete this gig?')) return;
    setActionLoading(gigId);
    try {
      await gigsApi.delete(gigId);
      await fetchGigs();
    } catch (err) {
      console.error('Error deleting gig:', err);
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Gigs</h1>
            <p className="text-gray-600">Manage your freelance service offerings</p>
          </div>
          <button
            onClick={onCreateGig}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Gig</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your gigs...</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">You haven't created any gigs yet.</p>
            <button
              onClick={onCreateGig}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Gig</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div key={gig.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                  {gig.image_url ? (
                    <img src={gig.image_url} alt={gig.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-5xl text-blue-300">{gig.title.charAt(0).toUpperCase()}</div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{gig.title}</h3>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${gig.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {gig.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-1">{gig.category}</p>
                  <p className="text-lg font-bold text-gray-900 mb-3">${(gig.price / 100).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mb-4">{gig.delivery_days} day delivery</p>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStatus(gig)}
                      disabled={actionLoading === gig.id}
                      className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      {gig.status === 'active' ? (
                        <><ToggleRight className="h-4 w-4 text-green-600" /><span>Deactivate</span></>
                      ) : (
                        <><ToggleLeft className="h-4 w-4 text-gray-400" /><span>Activate</span></>
                      )}
                    </button>

                    <button
                      onClick={() => deleteGig(gig.id)}
                      disabled={actionLoading === gig.id}
                      className="flex items-center space-x-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
