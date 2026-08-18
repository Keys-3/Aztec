import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Package, Star, Filter, Search, Eye, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getUserInventory, getUserShopListings, updateInventoryQuantity, createShopListing, removeShopListing, updateShopListingQuantity, getAllShopListings } from '../lib/firebase';
import AuthModal from './AuthModal';
import CheckoutModal from './CheckoutModal';

interface MarketplaceProps {
  onNavigate?: (page: string) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToCart, loadUserData, getInventoryQuantity, getShopQuantity } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allShopListings, setAllShopListings] = useState<any[]>([]);
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [userShopListings, setUserShopListings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [directBuyProduct, setDirectBuyProduct] = useState<any | null>(null);

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Marketplace</h2>
              <p className="text-gray-600">Please wait while we load your data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-gray-600">Browse fresh produce from local farmers</p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('cart')}
              className="mt-4 md:mt-0 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center space-x-2 shadow-md"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Go to Cart</span>
            </button>
          )}
        </div>
          
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

        {/* Filters */}
            <div className="mb-8 bg-white backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="leafy-greens">Leafy Greens</option>
                      <option value="herbs">Herbs</option>
                      <option value="fruits">Fruits & Vegetables</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {filteredProducts.length} products
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-gray-200">
                <ShoppingCart className="h-20 w-20 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Products Available</h2>
                <p className="text-gray-600 mb-8">Check back later for fresh produce from other farmers!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((listing) => (
                  <div key={listing.id} className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
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
                        <h3 className="text-xl font-semibold text-gray-900">{listing.product.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{listing.product.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{listing.product.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-semibold text-emerald-400 text-lg">₹{listing.price}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Seller:</span>
                          <span className="font-medium text-gray-900">{listing.user_profiles?.username || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Harvest Date:</span>
                          <span className="font-medium text-gray-900">{new Date(listing.product.harvest_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleAddToCart(listing.product)}
                          className="flex-1 bg-emerald-100 text-emerald-700 py-3 px-2 rounded-lg hover:bg-emerald-200 transition-colors font-medium flex items-center justify-center space-x-1"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (!user) {
                              setIsAuthModalOpen(true);
                              return;
                            }
                            setDirectBuyProduct(listing.product);
                          }}
                          className="flex-1 bg-emerald-600 text-white py-3 px-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center space-x-1"
                        >
                          <Package className="h-4 w-4" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        
        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={!!directBuyProduct}
          onClose={() => setDirectBuyProduct(null)}
          product={directBuyProduct}
        />
      </div>
    </div>
  );
};

export default Marketplace;