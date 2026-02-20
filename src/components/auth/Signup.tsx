import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Briefcase, ShoppingBag } from 'lucide-react';

interface SignupProps {
  onToggle: () => void;
}

export default function Signup({ onToggle }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 rounded-full p-3">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600 mb-8">Join our freelance marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`p-4 border-2 rounded-lg transition ${
                  role === 'client'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <ShoppingBag className={`h-6 w-6 mx-auto mb-2 ${
                  role === 'client' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-medium ${
                  role === 'client' ? 'text-green-900' : 'text-gray-700'
                }`}>
                  Hire Talent
                </div>
                <div className="text-xs text-gray-500 mt-1">I'm a client</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={`p-4 border-2 rounded-lg transition ${
                  role === 'freelancer'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Briefcase className={`h-6 w-6 mx-auto mb-2 ${
                  role === 'freelancer' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-medium ${
                  role === 'freelancer' ? 'text-green-900' : 'text-gray-700'
                }`}>
                  Offer Services
                </div>
                <div className="text-xs text-gray-500 mt-1">I'm a freelancer</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onToggle}
              className="font-medium text-green-600 hover:text-green-500 transition"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
