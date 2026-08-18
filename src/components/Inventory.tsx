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
      const enrichedInventory = inventory.map((invItem: any) => {
        const matchingListing = shopListings.find((listing: any) => 
          listing.product_id === invItem.product_id && listing.user_id === invItem.user_id
        );
        return {
          ...invItem,
          isListed: !!matchingListing,
          listedPrice: matchingListing ? matchingListing.price : (invItem.product?.price || 0),
        };
      });

      setUserInventory(enrichedInventory);
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
        await loadData();
        showMessage('success', `Item listed for sale!`);
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
      const success = await removeShopListing(targetUserId, productId);
      if (success) {
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
      if (listing) {
        await updateShopListing(targetUserId, productId, { quantity: newQuantity, price: newPrice });
      }
      await updateInventoryQuantity(targetUserId, productId, newQuantity);
      
      await loadData();
      showMessage('success', 'Item updated successfully!');
    } catch (error: any) {
      console.error('Error updating item:', error);
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

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">All Items</h2>
        </div>

        <div>
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
                  if (!item.product) return null;
                  
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setSelectedItem(item);
                      }}
                      className="bg-white backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-emerald-500/50 transition-colors group relative"
                    >
                      <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity" />
                      
                      {item.isListed && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center shadow-md">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Listed
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-400 transition-colors">{item.product?.name}</h3>
                        </div>
                        {user?.role === 'admin' && item.user_profiles && (
                          <p className="text-sm text-gray-600 mb-1">Farmer: {item.user_profiles.username}</p>
                        )}
                        <p className="text-emerald-400 font-medium mb-1">{item.quantity} units total</p>
                        {item.isListed && (
                          <p className="text-gray-500 text-sm mb-4">Price: ₹{item.listedPrice}</p>
                        )}
                        {!item.isListed && <div className="mb-4"></div>}
                        
                        <button className="w-full bg-white text-emerald-600 border border-emerald-600 py-2 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors font-medium">
                          Manage Item
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
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
