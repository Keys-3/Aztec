import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, ArrowRight } from 'lucide-react';
import { updateProduct } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface ManageItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
  onDeleteInventoryItem: (productId: string, targetUserId: string) => Promise<void>;
  onRemoveFromSale: (productId: string, targetUserId: string) => Promise<void>;
  onListForSale: (product: any, quantity: number, price: number, targetUserId: string) => Promise<void>;
  onUpdateListing: (productId: string, newQuantity: number, newPrice: number, targetUserId: string) => Promise<void>;
}

const ManageItemModal: React.FC<ManageItemModalProps> = ({
  isOpen, onClose, item, onSuccess,
  onDeleteInventoryItem, onRemoveFromSale, onListForSale, onUpdateListing
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    quality: '',
  });
  
  const [listQuantity, setListQuantity] = useState<number | ''>(1);
  const [listPrice, setListPrice] = useState<number | ''>(0);

  useEffect(() => {
    if (item && item.product) {
      setFormData({
        name: item.product.name || '',
        category: item.product.category || 'leafy-greens',
        description: item.product.description || '',
        quality: item.product.quality || 'Premium',
      });
      setListPrice(item.isListed ? item.listedPrice : (item.product.price || 0));
      setListQuantity(item.quantity || 1);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const success = await updateProduct(item.product.id, formData);
      if (success) {
        onSuccess();
      } else {
        setError('Failed to update item details.');
      }
    } catch (err) {
      console.error(err);
      setError('Error updating item.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await onDeleteInventoryItem(item.product.id, item.user_id);
    if (item.isListed) {
        await onRemoveFromSale(item.product.id, item.user_id);
    }
    onClose();
  };

  const handleList = async () => {
    if (item.isListed) {
        await onRemoveFromSale(item.product.id, item.user_id);
    } else {
        await onListForSale(item.product, listQuantity, listPrice, item.user_id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">Manage Item: {item.product.name}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Edit Details Form */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Details</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    <option value="leafy-greens">Leafy Greens</option>
                    <option value="herbs">Herbs</option>
                    <option value="fruits">Fruits & Veg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quality</label>
                  <select value={formData.quality} onChange={(e) => setFormData({...formData, quality: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description (Optional)</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 resize-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </form>
          </div>

          {/* Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock & Market Listing</h3>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Total Quantity in Inventory</label>
                  <input type="number" min="1" value={listQuantity} onChange={(e) => setListQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Price per unit (₹)</label>
                  <input type="number" min="0" step="0.01" value={listPrice} onChange={(e) => setListPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <button onClick={async () => {
                    await onUpdateListing(item.product.id, listQuantity === '' ? 1 : listQuantity, listPrice === '' ? 0 : listPrice, item.user_id);
                    onClose();
                }} disabled={listQuantity === '' || listQuantity <= 0 || listPrice === '' || listPrice <= 0} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Update Stock & Price</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                <h4 className="text-sm font-medium text-emerald-400 mb-3">Marketplace Visibility</h4>
                <button onClick={handleList} className={`w-full text-white py-2 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${item.isListed ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    <ArrowRight className="h-4 w-4" />
                    <span>{item.isListed ? 'Unlist from Market' : 'List on Marketplace'}</span>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    {item.isListed ? 'This item is visible to buyers.' : 'This item is hidden from buyers.'}
                </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="text-sm font-medium text-red-400 mb-3">Danger Zone</h4>
              <button onClick={handleDelete} className="w-full bg-red-600/20 text-red-400 border border-red-600/30 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium flex items-center justify-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Permanently Delete Item</span>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageItemModal;
