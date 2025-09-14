import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Package, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string;
  description?: string;
  harvest_date?: string;
  quality?: string;
  rating?: number;
}

interface ShopListing {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  products: Product;
  user_profiles: {
    username: string;
  };
}

interface UserInventory {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  products: Product;
}

export default function Marketplace() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'inventory'>('marketplace');
  const [shopListings, setShopListings] = useState<ShopListing[]>([]);
  const [userInventory, setUserInventory] = useState<UserInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadShopListings(), loadUserInventory()]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadShopListings = async () => {
    const { data, error } = await supabase
      .from('shop_listings')
      .select(`
        *,
        products (*),
        user_profiles (username)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading shop listings:', error);
      throw error;
    }

    setShopListings(data || []);
  };

  const loadUserInventory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', user.id)
      .gt('quantity', 0);

    if (error) {
      console.error('Error loading user inventory:', error);
      throw error;
    }

    setUserInventory(data || []);
  };

  const handleAddToCart = (product: Product, price: number) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      image: product.image_url || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg',
      quantity: 1
    });
  };

  const handleListForSale = async (inventoryItem: UserInventory, quantity: number, price: number) => {
    if (!user) return;

    try {
      // Check if listing already exists
      const { data: existingListing } = await supabase
        .from('shop_listings')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', inventoryItem.product_id)
        .eq('status', 'active')
        .single();

      if (existingListing) {
        // Update existing listing
        const { error } = await supabase
          .from('shop_listings')
          .update({
            quantity: existingListing.quantity + quantity,
            price: price,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingListing.id);

        if (error) throw error;
      } else {
        // Create new listing
        const { error } = await supabase
          .from('shop_listings')
          .insert({
            user_id: user.id,
            product_id: inventoryItem.product_id,
            quantity: quantity,
            price: price,
            status: 'active'
          });

        if (error) throw error;
      }

      // Update user inventory
      const newQuantity = inventoryItem.quantity - quantity;
      if (newQuantity > 0) {
        const { error } = await supabase
          .from('user_inventory')
          .update({ quantity: newQuantity })
          .eq('id', inventoryItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_inventory')
          .delete()
          .eq('id', inventoryItem.id);

        if (error) throw error;
      }

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error listing item for sale:', err);
      setError('Failed to list item for sale');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Marketplace</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'marketplace'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart className="w-5 h-5 inline-block mr-2" />
              Shop
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5 inline-block mr-2" />
              My Inventory
            </button>
          </div>
        </div>

        {activeTab === 'marketplace' ? (
          <MarketplaceTab 
            shopListings={shopListings} 
            onAddToCart={handleAddToCart}
            currentUserId={user?.id}
          />
        ) : (
          <InventoryTab 
            userInventory={userInventory} 
            onListForSale={handleListForSale}
          />
        )}
      </div>
    </div>
  );
}

function MarketplaceTab({ 
  shopListings, 
  onAddToCart, 
  currentUserId 
}: { 
  shopListings: ShopListing[]; 
  onAddToCart: (product: Product, price: number) => void;
  currentUserId?: string;
}) {
  if (shopListings.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No items for sale</h3>
        <p className="text-gray-500">Check back later for fresh produce!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {shopListings.map((listing) => (
        <div key={listing.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="aspect-w-16 aspect-h-12">
            <img
              src={listing.products.image_url || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg'}
              alt={listing.products.name}
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{listing.products.name}</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {listing.products.category}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {listing.products.description || 'Fresh, high-quality produce'}
            </p>
            
            <div className="flex items-center mb-3">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {listing.products.rating || 4.5} • {listing.products.quality || 'Premium'}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-bold text-green-600">${listing.price}</span>
                <span className="text-sm text-gray-500 ml-1">per unit</span>
              </div>
              <span className="text-sm text-gray-500">
                {listing.quantity} available
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                Sold by: {listing.user_profiles.username}
              </span>
              {listing.products.harvest_date && (
                <span className="text-xs text-gray-400">
                  Harvested: {new Date(listing.products.harvest_date).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {listing.user_id !== currentUserId && (
              <button
                onClick={() => onAddToCart(listing.products, listing.price)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </button>
            )}
            
            {listing.user_id === currentUserId && (
              <div className="bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-center text-sm">
                Your listing
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function InventoryTab({ 
  userInventory, 
  onListForSale 
}: { 
  userInventory: UserInventory[]; 
  onListForSale: (item: UserInventory, quantity: number, price: number) => void;
}) {
  const [listingData, setListingData] = useState<{[key: string]: {quantity: number, price: number}}>({});

  const handleQuantityChange = (itemId: string, change: number) => {
    setListingData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: Math.max(1, (prev[itemId]?.quantity || 1) + change)
      }
    }));
  };

  const handlePriceChange = (itemId: string, price: number) => {
    setListingData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        price: Math.max(0, price)
      }
    }));
  };

  const handleListItem = (item: UserInventory) => {
    const data = listingData[item.id];
    if (data && data.quantity > 0 && data.price > 0) {
      onListForSale(item, data.quantity, data.price);
      setListingData(prev => ({
        ...prev,
        [item.id]: { quantity: 1, price: 0 }
      }));
    }
  };

  if (userInventory.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Your inventory is empty</h3>
        <p className="text-gray-500">Purchase items to add them to your inventory!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userInventory.map((item) => {
        const currentListing = listingData[item.id] || { quantity: 1, price: 0 };
        const maxQuantity = item.quantity;
        
        return (
          <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-12">
              <img
                src={item.products.image_url || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg'}
                alt={item.products.name}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{item.products.name}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {item.products.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">
                You have {item.quantity} units in inventory
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to list
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={currentListing.quantity <= 1}
                      className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 bg-gray-50 rounded-md min-w-[3rem] text-center">
                      {currentListing.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      disabled={currentListing.quantity >= maxQuantity}
                      className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per unit ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentListing.price}
                    onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
                
                <button
                  onClick={() => handleListItem(item)}
                  disabled={currentListing.quantity <= 0 || currentListing.price <= 0}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  List for Sale
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}