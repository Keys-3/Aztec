import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Plus, Minus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserInventory, getUserShopListings, updateInventoryQuantity, createShopListing, removeShopListing, updateShopListing, getAllUserInventory, getAllShopListings, deleteInventoryItem } from '../lib/firebase';
import AddItemModal from './AddItemModal';
import ManageItemModal from './ManageItemModal';

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [userShopListings, setUserShopListings] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'inventory' | 'shop'>('inventory');
  const [activeTab, setActiveTab] = useState<'stock' | 'listed'>('stock');

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let inventory, shopListings;
      if (user.role === 'admin') {
        [inventory, shopListings] = await Promise.all([
          getAllUserInventory(),
          getAllShopListings()
        ]);
      } else {
        [inventory, shopListings] = await Promise.all([
          getUserInventory(user.id),
          getUserShopListings(user.id)
        ]);
      }
      setUserInventory(inventory);
      setUserShopListings(shopListings);
    } catch (error: any) {
      console.error('Error loading inventory data:', error);
      showMessage('error', `Failed to load data: ${error.message || 'Check console for details'}`);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleListForSale = async (product: any, quantity: number, price: number, targetUserId: string) => {
    if (!user) return;
    try {
      const success = await createShopListing(targetUserId, product.id, quantity, price);
      if (success) {
        // Find current inventory quantity locally
        const currentItem = userInventory.find(item => item.product_id === product.id && item.user_id === targetUserId);
        const currentInventoryQty = currentItem ? currentItem.quantity : 0;
        await updateInventoryQuantity(targetUserId, product.id, currentInventoryQty - quantity);
        
        await loadData();
        showMessage('success', `${quantity} ${product.name}(s) listed for sale!`);
      } else {
        showMessage('error', 'Failed to list item for sale');
      }
    } catch (error) {
      console.error('Error listing item:', error);
      showMessage('error', 'Failed to list item for sale');
    }
  };

  const handleRemoveFromSale = async (productId: string, targetUserId: string) => {
    if (!user) return;
    try {
      const listing = userShopListings.find(l => l.product_id === productId && l.user_id === targetUserId);
      if (!listing) return;

      const success = await removeShopListing(targetUserId, productId);
      if (success) {
        const currentItem = userInventory.find(item => item.product_id === productId && item.user_id === targetUserId);
        const currentInventoryQty = currentItem ? currentItem.quantity : 0;
        await updateInventoryQuantity(targetUserId, productId, currentInventoryQty + listing.quantity);
        
        await loadData();
        showMessage('success', 'Item removed from sale');
      } else {
        showMessage('error', 'Failed to remove item from sale');
      }
    } catch (error: any) {
      console.error('Error removing item from sale:', error);
      showMessage('error', `Error: ${error.message}`);
    }
  };

  const handleUpdateListing = async (productId: string, newQuantity: number, newPrice: number, targetUserId: string) => {
    if (!user) return;
    try {
      const listing = userShopListings.find(l => l.product_id === productId && l.user_id === targetUserId);
      if (!listing) return;

      const currentInventoryItem = userInventory.find(item => item.product_id === productId && item.user_id === targetUserId);
      const inventoryQty = currentInventoryItem ? currentInventoryItem.quantity : 0;
      
      const qtyDifference = newQuantity - listing.quantity;
      
      if (qtyDifference > 0 && qtyDifference > inventoryQty) {
        showMessage('error', 'Not enough inventory to increase listing quantity');
        return;
      }
      
      const success = await updateShopListing(targetUserId, productId, { quantity: newQuantity, price: newPrice });
      if (success) {
        if (qtyDifference !== 0) {
          await updateInventoryQuantity(targetUserId, productId, inventoryQty - qtyDifference);
        }
        await loadData();
        showMessage('success', 'Listing updated successfully!');
      } else {
        showMessage('error', 'Failed to update listing');
      }
    } catch (error: any) {
      console.error('Error updating listing:', error);
      showMessage('error', `Error: ${error.message}`);
    }
  };

  const handleDeleteInventoryItem = async (productId: string, targetUserId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this item from the inventory?')) return;
    
    try {
      const success = await deleteInventoryItem(targetUserId, productId);
      if (success) {
        await loadData();
        showMessage('success', 'Item successfully deleted from inventory.');
      } else {
        showMessage('error', 'Failed to delete item.');
      }
    } catch (error: any) {
      console.error('Error deleting inventory item:', error);
      showMessage('error', `Error: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-20">
          <div className="text-center">
            <Package className="h-20 w-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600">Please sign in to view your inventory</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {user?.role === 'admin' ? 'Global Inventory' : 'My Inventory'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'admin' ? 'Manage all active stock and market listings across the system' : 'Manage your stock and active market listings'}
            </p>
          </div>
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Custom Item</span>
          </button>
        </div>

        {message && (
          <div className={`mb-8 p-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' 
              : 'bg-red-600/20 text-red-400 border border-red-600/30'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="flex space-x-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-4 px-2 font-medium text-lg transition-colors relative ${
              activeTab === 'stock'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Available Stock
          </button>
          <button
            onClick={() => setActiveTab('listed')}
            className={`pb-4 px-2 font-medium text-lg transition-colors relative ${
              activeTab === 'listed'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Market Listings
          </button>
        </div>

        <div>
          {/* Inventory Items */}
          {activeTab === 'stock' && (
            <section>
            {userInventory.length === 0 ? (
              <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-gray-200">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inventory Empty</h3>
                <p className="text-gray-600">Harvest crops or add custom items to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userInventory.map((item) => {
                  if (!item.product) return null; // Skip if product couldn't be loaded
                  
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setSelectedItem(item);
                        setModalType('inventory');
                      }}
                      className="bg-white backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-emerald-500/50 transition-colors group"
                    >
                      <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity" />
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-400 transition-colors">{item.product?.name}</h3>
                        </div>
                        {user?.role === 'admin' && item.user_profiles && (
                          <p className="text-sm text-gray-600 mb-1">Farmer: {item.user_profiles.username}</p>
                        )}
                        <p className="text-emerald-400 font-medium mb-4">{item.quantity} units available</p>
                        <button className="w-full bg-white text-white py-2 rounded-lg group-hover:bg-emerald-600 transition-colors font-medium">
                          Manage Item
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          )}

          {/* Active Listings */}
          {activeTab === 'listed' && (
            <section>
            {userShopListings.length === 0 ? (
              <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-gray-200">
                <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Listings</h3>
                <p className="text-gray-600">Items you list for sale will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userShopListings.map((listing) => {
                  if (!listing.product) return null; // Skip if product couldn't be loaded
                  return (
                  <div 
                    key={listing.id} 
                    onClick={() => {
                      setSelectedItem(listing);
                      setModalType('shop');
                    }}
                    className="bg-white backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-emerald-500/50 transition-colors group"
                  >
                    <img src={listing.product?.image_url} alt={listing.product?.name} className="w-full h-32 object-cover group-hover:opacity-80 transition-opacity" />
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-400 transition-colors">{listing.product?.name}</h3>
                      {user?.role === 'admin' && listing.user_profiles && (
                        <p className="text-sm text-gray-600 mb-4">Farmer: {listing.user_profiles.username}</p>
                      )}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Listed Quantity:</span>
                          <span className="text-gray-900 font-medium">{listing.quantity} units</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Unit Price:</span>
                          <span className="text-emerald-400 font-semibold">₹{listing.price}</span>
                        </div>
                      </div>
                      <button className="w-full bg-white text-white py-2 rounded-lg group-hover:bg-emerald-600 transition-colors font-medium">
                        Manage Listing
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </section>
          )}
        </div>

        <AddItemModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onSuccess={() => {
            loadData();
            showMessage('success', 'Item successfully added to inventory!');
          }}
        />

        <ManageItemModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
          type={modalType}
          onSuccess={() => {
            loadData();
            setSelectedItem(null);
            showMessage('success', 'Item updated successfully!');
          }}
          onDeleteInventoryItem={handleDeleteInventoryItem}
          onRemoveFromSale={handleRemoveFromSale}
          onListForSale={handleListForSale}
          onUpdateListing={handleUpdateListing}
        />
      </div>
    </div>
  );
};

export default Inventory;
