import React, { useState } from 'react';
import { X, CreditCard, MapPin, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, processOrderQuantities } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, product }) => {
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [shippingDetails, setShippingDetails] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India'
  });

  if (!isOpen || !product) return null;

  const total = product.price * quantity;
  const grandTotal = total + 50; // Including delivery charges

  const handleCheckout = async () => {
    if (!user) return;

    // Validate shipping details
    const requiredFields = ['full_name', 'phone', 'address_line_1', 'city', 'state', 'postal_code'];
    const missingFields = requiredFields.filter(field => !shippingDetails[field as keyof typeof shippingDetails]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setError(null);
    setIsCheckingOut(true);

    try {
      // Create order
      const orderRef = await addDoc(collection(db, 'orders'), {
        user_id: user.id,
        total_amount: grandTotal,
        status: 'pending',
        shipping_address: shippingDetails,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Create order item
      await addDoc(collection(db, 'order_items'), {
        order_id: orderRef.id,
        product_id: product.id,
        quantity: quantity,
        price: product.price,
        created_at: new Date().toISOString()
      });

      // Process quantity reductions
      await processOrderQuantities([{
        product_id: product.id,
        quantity: quantity
      }]);

      setOrderPlaced(true);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const resetAndClose = () => {
    setOrderPlaced(false);
    setQuantity(1);
    onClose();
  };

  if (orderPlaced) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed!</h2>
          <p className="text-gray-600 mb-8">
            Your direct purchase of {quantity}x {product.name} was successful.
          </p>
          <button
            onClick={resetAndClose}
            className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-6 w-6 mr-2 text-emerald-600" />
            Direct Checkout
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Item Details</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-start space-x-4 mb-6">
              <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600">₹{product.price} / unit</p>
                
                <div className="flex items-center space-x-3 mt-3">
                  <span className="text-sm text-gray-700 font-medium">Quantity:</span>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({quantity} items)</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery</span>
                <span>₹50.00</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Form */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
              Shipping Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={shippingDetails.full_name}
                    onChange={(e) => setShippingDetails({...shippingDetails, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={shippingDetails.address_line_1}
                  onChange={(e) => setShippingDetails({...shippingDetails, address_line_1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={shippingDetails.address_line_2}
                  onChange={(e) => setShippingDetails({...shippingDetails, address_line_2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={shippingDetails.city}
                    onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={shippingDetails.state}
                    onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                <input
                  type="text"
                  value={shippingDetails.postal_code}
                  onChange={(e) => setShippingDetails({...shippingDetails, postal_code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start space-x-2">
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full mt-8 bg-emerald-600 text-white py-4 px-6 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Pay ₹{grandTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
