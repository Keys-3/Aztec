import React, { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import { createProduct, addInventoryQuantity } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_IMAGES: Record<string, string> = {
  tomato: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
  lettuce: 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg',
  spinach: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg',
  herbs: 'https://images.pexels.com/photos/2892305/pexels-photo-2892305.jpeg',
  cabbage: 'https://images.pexels.com/photos/2518893/pexels-photo-2518893.jpeg',
  pepper: 'https://images.pexels.com/photos/2893639/pexels-photo-2893639.jpeg',
  'leafy-greens': 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg',
  fruits: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg',
  default: 'https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg'
};

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'leafy-greens',
    description: '',
    quality: 'Premium',
    yield: 1,
    price: 0,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Determine image based on name or category
      const lowerName = formData.name.toLowerCase();
      let selectedImage = DEFAULT_IMAGES.default;
      
      for (const [key, url] of Object.entries(DEFAULT_IMAGES)) {
        if (lowerName.includes(key) || formData.category === key) {
          selectedImage = url;
          break;
        }
      }

      const newProductData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        quality: formData.quality,
        price: formData.price,
        stock: 0, // global shop stock is 0 initially
        image_url: selectedImage,
        harvest_date: new Date().toISOString(),
        rating: 5.0, 
      };

      const newProductId = await createProduct(newProductData);
      
      if (newProductId) {
        await addInventoryQuantity(user.id, newProductId, formData.yield);
        onSuccess();
        onClose();
        setFormData({
          name: '',
          category: 'leafy-greens',
          description: '',
          quality: 'Premium',
          yield: 1,
          price: 0,
        });
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item to inventory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center text-gray-900">
            <Package className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-bold">Add to Inventory</h2>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-gray-900 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g. Fresh Cherry Tomatoes"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="leafy-greens">Leafy Greens</option>
                <option value="herbs">Herbs</option>
                <option value="fruits">Fruits & Veg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Premium">Premium</option>
                <option value="Standard">Standard</option>
                <option value="Organic">Organic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yield Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={formData.yield}
                onChange={(e) => setFormData({ ...formData, yield: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Describe your harvest (optional)..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Add to Inventory</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
