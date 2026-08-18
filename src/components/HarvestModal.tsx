import React, { useState } from 'react';
import { X, CheckCircle, Package } from 'lucide-react';

interface HarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName: string | null;
  onConfirm: (quantity: number) => void;
}

const HarvestModal: React.FC<HarvestModalProps> = ({ isOpen, onClose, plantName, onConfirm }) => {
  const [quantity, setQuantity] = useState(10);
  const [error, setError] = useState('');

  if (!isOpen || !plantName) return null;

  const handleSubmit = () => {
    if (quantity <= 0) {
      setError('Please enter a valid positive number.');
      return;
    }
    onConfirm(quantity);
    setQuantity(10);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2 text-emerald-600" />
            Harvest Crop
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-4">How many units of <span className="font-semibold text-gray-900">{plantName}</span> did you harvest?</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input 
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Confirm Harvest</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HarvestModal;
