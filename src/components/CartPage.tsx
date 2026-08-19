import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart, CreditCard, MapPin, Package, ClipboardList } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db, processOrderQuantities } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

import OrderHistory from './OrderHistory';

interface CartPageProps {
  onNavigate?: (page: string) => void;
}

const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { items, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'cart' | 'history'>('cart');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (user) {
      setShippingDetails(prev => ({
        ...prev,
        full_name: prev.full_name || user.username || '',
        phone: prev.phone || user.contact || '',
        address_line_1: prev.address_line_1 || user.address_line_1 || '',
        address_line_2: prev.address_line_2 || user.address_line_2 || '',
        city: prev.city || user.city || '',
        state: prev.state || user.state || '',
        postal_code: prev.postal_code || user.postal_code || '',
        country: prev.country || user.country || 'India'
      }));
    }
  }, [user]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      if (onNavigate) onNavigate('login');
      return;
    }

    if (items.length === 0) return;

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
      const grandTotal = total + 50;
      let paymentStatus = 'pending';
      let razorpayPaymentId = null;

      // Create order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        user_id: user.id,
        total_amount: grandTotal,
        status: 'pending',
        payment_method: 'cod',
        payment_status: paymentStatus,
        razorpay_payment_id: razorpayPaymentId,
        shipping_address: shippingDetails,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Create order items
      const orderItemsPromises = items.map(item => 
        addDoc(collection(db, 'order_items'), {
          order_id: orderRef.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          created_at: new Date().toISOString()
        })
      );

      await Promise.all(orderItemsPromises);

      // Process quantity reductions
      await processOrderQuantities(items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      })));

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

    } catch (err: any) {
      console.error('Error placing order:', err);
      if (err.message === 'Payment cancelled') {
        setError('Payment was cancelled. You can try again.');
      } else {
        setError('Failed to place order. Please try again.');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-gray-200">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-700 mb-8">
              Thank you for your order. We'll process it shortly and send you a confirmation email.
            </p>
            <button
              onClick={() => {
                setOrderPlaced(false);
                setCurrentView('history');
              }}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              View Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Shopping Cart</h1>
          <p className="text-gray-600">Review your items and complete checkout</p>
          
          {/* View Toggle */}
          <div className="mt-6 flex space-x-1 border-b border-gray-200 w-full mb-8">
            <button
              onClick={() => setCurrentView('cart')}
              className={`pb-4 px-4 font-medium transition-colors relative ${
                currentView === 'cart'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingCart className="h-5 w-5 inline mr-2" />
              Cart Items ({items.length})
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`pb-4 px-4 font-medium transition-colors relative ${
                currentView === 'history'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="h-5 w-5 inline mr-2" />
              Order History
            </button>
          </div>
        </div>

        {/* History View */}
        {currentView === 'history' && (
           <OrderHistory isModal={false} isOpen={true} />
        )}

        {/* Cart View */}
        {currentView === 'cart' && (
          <>
            {items.length === 0 ? (
              <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-gray-200">
                <ShoppingBag className="h-20 w-20 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8">Add some fresh produce to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900">Shopping Cart ({items.length} items)</h2>
                    </div>
                    <div className="p-6 space-y-6">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
                            <p className="text-gray-600 text-sm">{item.product.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-emerald-600 font-bold">₹{item.product.price}</span>
                              <span className="text-gray-600">per {item.product.category === 'herbs' ? 'bunch' : 'kg'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-4 w-4 text-gray-900" />
                            </button>
                            <span className="text-gray-900 font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-4 w-4 text-emerald-700" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-500 hover:text-red-600 mt-2 transition-colors"
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
                  <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Delivery</span>
                        <span>₹50.00</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                          <span>Total</span>
                          <span>₹{(total + 50).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                      Shipping Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={shippingDetails.full_name}
                            onChange={(e) => setShippingDetails({...shippingDetails, full_name: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={shippingDetails.phone}
                            onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.address_line_1}
                          onChange={(e) => setShippingDetails({...shippingDetails, address_line_1: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Street address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.address_line_2}
                          onChange={(e) => setShippingDetails({...shippingDetails, address_line_2: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={shippingDetails.city}
                            onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            value={shippingDetails.state}
                            onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="State"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.postal_code}
                          onChange={(e) => setShippingDetails({...shippingDetails, postal_code: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Postal code"
                        />
                      </div>
                    </div>
                  </div>


                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start space-x-2">
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || items.length === 0}
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
                        <span>Place Order - ₹{(total + 50).toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        

      </div>
    </div>
  );
};

export default CartPage;