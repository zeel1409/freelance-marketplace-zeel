import { Star, Clock, User } from 'lucide-react';
import { Gig } from '../../lib/api';

interface GigCardProps {
  gig: Gig;
  onClick: () => void;
}

export default function GigCard({ gig, onClick }: GigCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
        {gig.image_url ? (
          <img src={gig.image_url} alt={gig.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl text-blue-300">
            {gig.title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">{gig.profiles?.full_name || 'Freelancer'}</div>
          </div>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
            {gig.category}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {gig.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {gig.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <span className="text-xs text-gray-600 ml-1">5.0</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{gig.delivery_days}d delivery</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Starting at</span>
            <span className="text-2xl font-bold text-gray-900">
              ${(gig.price / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
