import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Header from './components/layout/Header';
import Home from './pages/Home';
import CreateGig from './pages/CreateGig';
import MyGigs from './pages/MyGigs';
import Orders from './pages/Orders';
import Messages from './pages/Messages';

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <Signup onToggle={() => setShowLogin(true)} />
    );
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedOrderId(undefined);
  };

  const handleMessageClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentPage('messages');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'create-gig':
        return (
          <CreateGig
            onBack={() => handleNavigate('home')}
            onGigCreated={() => handleNavigate('my-gigs')}
          />
        );
      case 'my-gigs':
        return <MyGigs onCreateGig={() => handleNavigate('create-gig')} />;
      case 'orders':
        return <Orders onMessageClick={handleMessageClick} />;
      case 'messages':
        return <Messages selectedOrderId={selectedOrderId} />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
