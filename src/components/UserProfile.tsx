import React, { useState } from 'react';
import { User, LogOut, Settings, ShoppingBag, ChevronDown, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import OrderHistory from './OrderHistory';

const UserProfile: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const { user, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
      >
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="hidden sm:inline font-medium">{user.username}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isDropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user.username}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-500">{user.contact}</div>
                </div>
              </div>
            </div>
            
            <div className="py-2">
              <button 
                onClick={() => {
                  setShowOrderHistory(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>My Orders</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Account Settings</span>
              </button>
              <hr className="my-2" />
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Order History Modal */}
      {showOrderHistory && (
        <OrderHistory 
          isOpen={showOrderHistory} 
          onClose={() => setShowOrderHistory(false)} 
        />
      )}
    </div>
  );
};

export default UserProfile;