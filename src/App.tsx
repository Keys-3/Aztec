import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import ContactPage from './components/ContactPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

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
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <main>
          {renderPage()}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;