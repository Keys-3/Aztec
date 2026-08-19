import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { getUserInventory, getUserShopListings } from './lib/firebase';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Inventory from './components/Inventory';
import CartPage from './components/CartPage';
import ContactPage from './components/ContactPage';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { loading, user } = useAuth();

  useEffect(() => {
    // Redirections handled by individual components to show previews
  }, [user, currentPage]);


  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Aztec Hydroponics</h2>
          <p className="text-gray-600">Please wait while we initialize your session...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'login':
        return <AuthPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        if (!user || (user.role === 'farmer' || user.role === 'admin')) return <Dashboard onNavigate={setCurrentPage} />;
        return <HomePage />;
      case 'marketplace':
        if (!user || (user.role === 'customer' || user.role === 'admin')) return <Marketplace onNavigate={setCurrentPage} />;
        return <HomePage />;
      case 'inventory':
        if (!user || (user.role === 'farmer' || user.role === 'admin')) return <Inventory onNavigate={setCurrentPage} />;
        return <HomePage />;
      case 'cart':
        if (!user || (user.role === 'customer' || user.role === 'admin')) return <CartPage onNavigate={setCurrentPage} />;
        return <HomePage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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