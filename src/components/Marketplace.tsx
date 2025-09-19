import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Package, Star, Filter, Search, Eye, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getUserInventory, getUserShopListings, updateInventoryQuantity, createShopListing, removeShopListing, updateShopListingQuantity, getAllShopListings } from '../lib/supabase';
import AuthModal from './AuthModal';

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, loadUserData, getInventoryQuantity, getShopQuantity } = useCart();
  const [currentView, setCurrentView] = useState<'marketplace' | 'inventory'>('marketplace');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allShopListings, setAllShopListings] = useState<any[]>([]);
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [userShopListings, setUserShopListings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load data on component mount and when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [inventory, shopListings, allListings] = await Promise.all([
        getUserInventory(user.id),
        getUserShopListings(user.id),
        getAllShopListings()
      ]);

      setUserInventory(inventory);
      setUserShopListings(shopListings);
      setAllShopListings(allListings);
      
      // Update cart context with user data
      loadUserData(inventory, shopListings);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddToCart = (product: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    addToCart(product, 1);
    showMessage('success', `${product.name} added to cart!`);
  };

  const handleListForSale = async (product: any, quantity: number, price: number) => {
    if (!user) return;

    try {
      const success = await createShopListing(user.id, product.id, quantity, price);
      if (success) {
        // Update inventory quantity
        const currentInventoryQty = getInventoryQuantity(product.id);
        await updateInventoryQuantity(user.id, product.id, currentInventoryQty - quantity);
        
        // Reload data
        await loadAllData();
        showMessage('success', `${quantity} ${product.name}(s) listed for sale!`);
      } else {
        showMessage('error', 'Failed to list item for sale');
      }
    } catch (error) {
      console.error('Error listing item:', error);
      showMessage('error', 'Failed to list item for sale');
    }
  };

  const handleRemoveFromSale = async (productId: string) => {
    if (!user) return;

    try {
      const listing = userShopListings.find(l => l.product_id === productId);
      if (!listing) return;

      const success = await removeShopListing(user.id, productId);
      if (success) {
        // Return quantity to inventory
        const currentInventoryQty = getInventoryQuantity(productId);
        await updateInventoryQuantity(user.id, productId, currentInventoryQty + listing.quantity);
        
        // Reload data
        await loadAllData();
        showMessage('success', 'Item removed from sale');
      } else {
        showMessage('error', 'Failed to remove item from sale');
      }
    } catch (error) {
      console.error('Error removing item from sale:', error);
      showMessage('error', 'Failed to remove item from sale');
    }
  };

  // Filter products for marketplace
  const filteredProducts = allShopListings.filter(listing => {
    if (!listing.product) return false;
    const matchesFilter = filter === 'all' || listing.product.category === filter;
    const matchesSearch = listing.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Loading Marketplace</h2>
              <p className="text-gray-400">Please wait while we load your data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Marketplace & Inventory</h1>
          <p className="text-gray-400">Manage your inventory and browse fresh produce from other farmers</p>
          
          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' 
                : 'bg-red-600/20 text-red-400 border border-red-600/30'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}
          
          {/* View Toggle */}
          <div className="mt-6 flex space-x-1 bg-gray-800 rounded-lg p-1 w-fit">
            <button
              onClick={() => setCurrentView('marketplace')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'marketplace'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="h-4 w-4 inline mr-2" />
              Marketplace
            </button>
            <button
              onClick={() => setCurrentView('inventory')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'inventory'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              My Inventory
            </button>
          </div>
        </div>

        {/* Marketplace View */}
        {currentView === 'marketplace' && (
          <>
            {/* Filters */}
            <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="leafy-greens">Leafy Greens</option>
                      <option value="herbs">Herbs</option>
                      <option value="fruits">Fruits & Vegetables</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Showing {filteredProducts.length} products
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-gray-700">
                <ShoppingCart className="h-20 w-20 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">No Products Available</h2>
                <p className="text-gray-400 mb-8">Check back later for fresh produce from other farmers!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((listing) => (
                  <div key={listing.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700">
                    <div className="relative">
                      <img 
                        src={listing.product.image_url} 
                        alt={listing.product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {listing.product.quality}
                      </div>
                      <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {listing.quantity} available
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-white">{listing.product.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-400">{listing.product.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{listing.product.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Price:</span>
                          <span className="font-semibold text-emerald-400 text-lg">₹{listing.price}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Seller:</span>
                          <span className="font-medium text-white">{listing.user_profiles?.username || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Harvest Date:</span>
                          <span className="font-medium text-white">{new Date(listing.product.harvest_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {listing.user_id !== user?.id ? (
                        <button 
                          onClick={() => handleAddToCart(listing.product)}
                          className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </button>
                      ) : (
                        <div className="w-full bg-blue-600/20 text-blue-400 py-3 px-4 rounded-lg text-center font-medium border border-blue-600/30">
                          Your Listing
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Inventory View */}
        {currentView === 'inventory' && (
          <InventoryView 
            userInventory={userInventory}
            userShopListings={userShopListings}
            onListForSale={handleListForSale}
            onRemoveFromSale={handleRemoveFromSale}
            user={user}
          />
        )}
        
        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    </div>
  );
};

// Inventory View Component
const InventoryView: React.FC<{
  userInventory: any[];
  userShopListings: any[];
  onListForSale: (product: any, quantity: number, price: number) => void;
  onRemoveFromSale: (productId: string) => void;
  user: any;
}> = ({ userInventory, userShopListings, onListForSale, onRemoveFromSale, user }) => {
  const [listingForms, setListingForms] = useState<{[key: string]: {quantity: number, price: number}}>({});

  const updateListingForm = (productId: string, field: 'quantity' | 'price', value: number) => {
    setListingForms(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const getListingForm = (productId: string) => {
    return listingForms[productId] || { quantity: 1, price: 0 };
  };

  const handleSubmitListing = (product: any) => {
    const form = getListingForm(product.id);
    if (form.quantity > 0 && form.price > 0) {
      onListForSale(product, form.quantity, form.price);
      // Reset form
      setListingForms(prev => ({
        ...prev,
        [product.id]: { quantity: 1, price: 0 }
      }));
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-gray-700">
        <Package className="h-20 w-20 text-gray-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
        <p className="text-gray-400">Please sign in to view your inventory</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Inventory */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">My Inventory</h2>
        {userInventory.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-gray-700">
            <Package className="h-20 w-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">No Items in Inventory</h3>
            <p className="text-gray-400">Purchase items to add them to your inventory</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInventory.map((item) => {
              const form = getListingForm(item.product.id);
              const maxQuantity = item.quantity;
              
              return (
                <div key={item.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{item.product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">Available: {item.quantity} units</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Quantity to list</label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateListingForm(item.product.id, 'quantity', Math.max(1, form.quantity - 1))}
                            className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-4 w-4 text-white" />
                          </button>
                          <span className="text-white font-medium w-12 text-center">{form.quantity}</span>
                          <button
                            onClick={() => updateListingForm(item.product.id, 'quantity', Math.min(maxQuantity, form.quantity + 1))}
                            className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Price per unit (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={(e) => updateListingForm(item.product.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                      
                      <button
                        onClick={() => handleSubmitListing(item.product)}
                        disabled={form.quantity <= 0 || form.price <= 0 || form.quantity > maxQuantity}
                        className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        List for Sale
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current Shop Listings */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">My Shop Listings</h2>
        {userShopListings.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
            <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Items Listed</h3>
            <p className="text-gray-400">List items from your inventory to start selling</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userShopListings.map((listing) => (
              <div key={listing.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <img
                  src={listing.product.image_url}
                  alt={listing.product.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{listing.product.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Quantity:</span>
                      <span className="text-white">{listing.quantity} units</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-emerald-400 font-semibold">₹{listing.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Value:</span>
                      <span className="text-white font-semibold">₹{(listing.quantity * listing.price).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onRemoveFromSale(listing.product_id)}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove from Sale</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;