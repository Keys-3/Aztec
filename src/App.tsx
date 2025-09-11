import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import ContactPage from './components/ContactPage';
import CartPage from './components/CartPage';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();
  console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

  // Show loading spinner while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login panel if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <main>
          <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold text-white">
                  Welcome to Aztec Hydroponics
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Please sign in to access your dashboard and manage your hydroponic system
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-lg"
                >
                  Sign In / Sign Up
                </button>
                <p className="mt-4 text-center text-sm text-gray-600">
                  New to Aztec? Create an account to get started with smart hydroponic farming.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    );
  }

  // Show account dashboard if authenticated
  if (currentPage === 'account' || (!['home', 'dashboard', 'marketplace', 'contact', 'cart'].includes(currentPage))) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <main>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Dashboard</h1>
                  <p className="text-gray-600">Manage your account and view your activity</p>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border">{user.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                        <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border">{user.contact}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                        <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setCurrentPage('dashboard')}
                      className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => setCurrentPage('marketplace')}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Inventory
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'dashboard':
        return <Dashboard />;
      case 'marketplace':
        return <Marketplace />;
      case 'contact':
        return <ContactPage />;
      case 'cart':
        return <CartPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;