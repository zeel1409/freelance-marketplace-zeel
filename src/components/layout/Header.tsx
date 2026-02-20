import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Plus } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
            >
              FreelanceHub
            </button>
          </div>

          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`${
                currentPage === 'home' ? 'text-blue-600' : 'text-gray-700'
              } hover:text-blue-600 transition font-medium`}
            >
              Browse Gigs
            </button>
            {profile?.role === 'freelancer' && (
              <button
                onClick={() => onNavigate('my-gigs')}
                className={`${
                  currentPage === 'my-gigs' ? 'text-blue-600' : 'text-gray-700'
                } hover:text-blue-600 transition font-medium`}
              >
                My Gigs
              </button>
            )}
            <button
              onClick={() => onNavigate('orders')}
              className={`${
                currentPage === 'orders' ? 'text-blue-600' : 'text-gray-700'
              } hover:text-blue-600 transition font-medium`}
            >
              Orders
            </button>
            <button
              onClick={() => onNavigate('messages')}
              className={`${
                currentPage === 'messages' ? 'text-blue-600' : 'text-gray-700'
              } hover:text-blue-600 transition font-medium`}
            >
              Messages
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {profile?.role === 'freelancer' && (
              <button
                onClick={() => onNavigate('create-gig')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create Gig</span>
              </button>
            )}

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{profile?.full_name}</div>
                <div className="text-xs text-gray-500 capitalize">{profile?.role}</div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                aria-label="View profile"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
