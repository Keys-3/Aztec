import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, MapPin, User, Phone, Mail, ArrowLeft, DollarSign, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';

const CartPage: React.FC = () => {
  const { items, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'purchase' | 'selling'>('purchase');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
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

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (items.length === 0) return;

    // Validate shipping details
    const requiredFields = ['full_name', 'phone', 'address_line_1', 'city', 'state', 'postal_code'];
    const missingFields = requiredFields.filter(field => !shippingDetails[field as keyof typeof shippingDetails]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: total,
            status: 'pending',
            shipping_address: shippingDetails
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and show success
      clearCart();
      setOrderPlaced(true);
      
      // Reset form
      setShippingDetails({
        full_name: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India'
      });

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Separate items for purchase and selling
  const purchaseItems = items.filter(item => !item.product.forSale);
  const sellingItems = items.filter(item => item.product.forSale);
  const purchaseTotal = purchaseItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const sellingTotal = sellingItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-300 mb-8">
              Thank you for your order. We'll process it shortly and send you a confirmation email.
            </p>
            <button
              onClick={() => setOrderPlaced(false)}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Continue Shopping
            </button>
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
          <h1 className="text-4xl font-bold text-white mb-2">Cart & Marketplace</h1>
          <p className="text-gray-400">Manage your purchases and items for sale</p>
          
          {/* Tab Navigation */}
          <div className="mt-6 flex space-x-1 bg-gray-800 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('purchase')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'purchase'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="h-4 w-4 inline mr-2" />
              Purchase Cart ({purchaseItems.length})
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'selling'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <DollarSign className="h-4 w-4 inline mr-2" />
              Items for Sale ({sellingItems.length})
            </button>
          </div>
        </div>

        {/* Purchase Cart Tab */}
        {activeTab === 'purchase' && (
          <>
            {purchaseItems.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-gray-700">
                <ShoppingBag className="h-20 w-20 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Your purchase cart is empty</h2>
                <p className="text-gray-400 mb-8">Add some fresh produce from our marketplace to get started!</p>
                <button className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
                    <div className="p-6 border-b border-gray-700">
                      <h2 className="text-2xl font-bold text-white">Purchase Items ({purchaseItems.length})</h2>
                    </div>
                    <div className="p-6 space-y-6">
                      {purchaseItems.map((item) => (
                        <div key={item.product.id} className="flex items-center space-x-4 bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{item.product.name}</h3>
                            <p className="text-gray-400 text-sm">{item.product.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-emerald-400 font-bold">₹{item.product.price}</span>
                              <span className="text-gray-500">per {item.product.category === 'herbs' ? 'bunch' : 'kg'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-4 w-4 text-white" />
                            </button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-4 w-4 text-white" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-400 hover:text-red-300 mt-2 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkout Section */}
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-300">
                        <span>Subtotal</span>
                        <span>₹{purchaseTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Delivery</span>
                        <span>₹50.00</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between text-xl font-bold text-white">
                          <span>Total</span>
                          <span>₹{(purchaseTotal + 50).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Shipping Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={shippingDetails.full_name}
                            onChange={(e) => setShippingDetails({...shippingDetails, full_name: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={shippingDetails.phone}
                            onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.address_line_1}
                          onChange={(e) => setShippingDetails({...shippingDetails, address_line_1: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Street address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.address_line_2}
                          onChange={(e) => setShippingDetails({...shippingDetails, address_line_2: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={shippingDetails.city}
                            onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            value={shippingDetails.state}
                            onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="State"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.postal_code}
                          onChange={(e) => setShippingDetails({...shippingDetails, postal_code: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Postal code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || purchaseItems.length === 0}
                    className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Place Order - ₹{(purchaseTotal + 50).toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Selling Items Tab */}
        {activeTab === 'selling' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-gray-700">
            {sellingItems.length === 0 ? (
              <>
                <DollarSign className="h-20 w-20 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">No items listed for sale</h2>
                <p className="text-gray-400 mb-8">Go to inventory to list your products for sale!</p>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Items Listed for Sale</h2>
                  <div className="bg-emerald-900/30 border border-emerald-400/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-medium">Total Potential Revenue:</span>
                      <span className="text-2xl font-bold text-emerald-400">₹{sellingTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {sellingItems.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4 bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-white">{item.product.name}</h3>
                        <p className="text-gray-400 text-sm">Listed for sale</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-emerald-400 font-bold">₹{item.product.price} each</span>
                          <span className="text-gray-300">Quantity: {item.quantity}</span>
                          <span className="text-emerald-400 font-bold">Total: ₹{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
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

export default CartPage;