import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, MapPin, Eye, Truck, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, Order, OrderItem, updateOrderStatus } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ isOpen, onClose, isModal = true }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useAuth();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'orders'), 
        where('user_id', '==', user.id)
      );
      
      const querySnapshot = await getDocs(q);
      const ordersData: Order[] = [];
      
      for (const d of querySnapshot.docs) {
         const orderData = d.data();
         
         // Fetch order items
         const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', d.id));
         const itemsSnapshot = await getDocs(itemsQ);
         
         const order_items: OrderItem[] = [];
         for (const idoc of itemsSnapshot.docs) {
             const itemData = idoc.data();
             // Fetch product
             const productDoc = await getDoc(doc(db, 'products', itemData.product_id));
             let product = undefined;
             if (productDoc.exists()) {
                 product = { id: productDoc.id, ...productDoc.data() };
             }
             
             order_items.push({
                 id: idoc.id,
                 ...itemData,
                 product
             } as any);
         }
         
         ordersData.push({
             id: d.id,
             ...orderData,
             order_items
         } as any);
      }
      
      ordersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-400" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-400" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const success = await updateOrderStatus(orderId, newStatus);
      if (success) {
        // Update local state
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className={`bg-white rounded-2xl w-full ${isModal ? 'shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200' : ''}`}>
      {/* Header */}
      {isModal && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="h-6 w-6 mr-2 text-emerald-600" />
            Order History
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`p-6 overflow-y-auto ${isModal ? 'max-h-[calc(90vh-120px)]' : ''}`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-400">Start shopping to see your order history here!</p>
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
              >
                <span>&larr; Back to Orders</span>
              </button>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-100 pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h3>
                    <p className="text-gray-500">Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-medium border flex items-center space-x-2 ${getStatusColor(selectedOrder.status)} w-fit`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mb-8 overflow-x-auto pb-4">
                  <div className="flex items-center min-w-[500px]">
                    {['pending', 'processing', 'shipped', 'delivered'].map((step, index, arr) => {
                      const isActive = 
                        (step === 'pending' && ['pending', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status)) ||
                        (step === 'processing' && ['processing', 'shipped', 'delivered'].includes(selectedOrder.status)) ||
                        (step === 'shipped' && ['shipped', 'delivered'].includes(selectedOrder.status)) ||
                        (step === 'delivered' && selectedOrder.status === 'delivered');
                      const isCancelledOrReturned = ['cancelled', 'returned'].includes(selectedOrder.status);

                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCancelledOrReturned ? 'bg-red-100 text-red-500' : isActive ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                              {step === 'pending' && <Clock className="w-5 h-5" />}
                              {step === 'processing' && <Package className="w-5 h-5" />}
                              {step === 'shipped' && <Truck className="w-5 h-5" />}
                              {step === 'delivered' && <CheckCircle className="w-5 h-5" />}
                            </div>
                            <span className={`mt-2 text-xs font-medium capitalize ${isActive && !isCancelledOrReturned ? 'text-emerald-600' : 'text-gray-500'}`}>{step}</span>
                          </div>
                          {index < arr.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 rounded ${isCancelledOrReturned ? 'bg-red-200' : isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Items</h4>
                    <div className="space-y-4">
                      {selectedOrder.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                          {item.product && (
                            <>
                              <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">{item.product.name}</h5>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-right">
                      <span className="text-gray-500 mr-4">Total</span>
                      <span className="text-2xl font-bold text-emerald-600">₹{selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1 text-gray-700">
                      <div className="font-semibold text-gray-900">{selectedOrder.shipping_address.full_name}</div>
                      <div>{selectedOrder.shipping_address.address_line_1}</div>
                      {selectedOrder.shipping_address.address_line_2 && <div>{selectedOrder.shipping_address.address_line_2}</div>}
                      <div>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</div>
                      <div>{selectedOrder.shipping_address.country}</div>
                      <div className="pt-2 text-sm">Phone: {selectedOrder.shipping_address.phone}</div>
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 mt-8 mb-4">Actions</h4>
                    <div className="space-y-3">
                      {selectedOrder.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                          disabled={updatingId === selectedOrder.id}
                          className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Cancel Order
                        </button>
                      )}
                      {selectedOrder.status === 'delivered' && (
                        <button 
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'returned')}
                          disabled={updatingId === selectedOrder.id}
                          className="w-full bg-yellow-50 text-yellow-700 border border-yellow-200 py-2 rounded-lg font-medium hover:bg-yellow-100 transition-colors disabled:opacity-50"
                        >
                          Return Order
                        </button>
                      )}
                      
                      {/* Admin Controls */}
                      {user?.role === 'admin' && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <p className="text-xs font-bold text-purple-600 uppercase mb-3">Admin Controls</p>
                          <div className="grid grid-cols-2 gap-2">
                            {['pending', 'processing', 'shipped', 'delivered'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                disabled={selectedOrder.status === status || updatingId === selectedOrder.id}
                                className={`py-2 px-3 text-xs font-medium rounded-lg capitalize border ${
                                  selectedOrder.status === status 
                                    ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                Mark {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-emerald-400 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-600">
                        ₹{order.total_amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  {order.order_items && (
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        {order.order_items.slice(0, 3).map((item) => (
                          item.product && (
                            <img
                              key={item.id}
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            />
                          )
                        ))}
                        {order.order_items.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            +{order.order_items.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
                      </span>
                      <div className="flex-1 text-right">
                         <span className="text-emerald-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details &rarr;
                         </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {content}
    </div>
  );
};

export default OrderHistory;