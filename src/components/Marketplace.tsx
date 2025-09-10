import React, { useState } from 'react';
import { Package, TrendingUp, Calendar, MapPin, Filter, Search, Star, ShoppingCart, DollarSign, Shield, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Marketplace: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inventoryStock, setInventoryStock] = useState<{[key: string]: number}>({
    'prod-1': 25,
    'prod-2': 18,
    'prod-3': 32,
    'prod-4': 22,
    'prod-5': 15,
    'prod-6': 28
  });
  const [quantityModal, setQuantityModal] = useState<{
    isOpen: boolean;
    product: any;
    action: 'sell' | 'reserve';
    quantity: number;
  }>({
    isOpen: false,
    product: null,
    action: 'sell',
    quantity: 1
  });
  const { addToCart, addToSelling, removeFromSelling, sellingItems } = useCart();
  const { user } = useAuth();

  const products = [
    {
      id: 'prod-1',
      name: 'Organic Lettuce',
      category: 'leafy-greens',
      price: 399,
      stock: inventoryStock['prod-1'],
      image: 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg',
      harvest_date: '2025-01-10',
      quality: 'Premium',
      rating: 4.9,
      description: 'Fresh, crisp lettuce grown in our state-of-the-art hydroponic system.',
      image_url: 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg'
    },
    {
      id: 'prod-2',
      name: 'Cherry Tomatoes',
      category: 'fruits',
      price: 559,
      stock: inventoryStock['prod-2'],
      image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
      harvest_date: '2025-01-08',
      quality: 'Premium',
      rating: 4.8,
      description: 'Sweet, vine-ripened cherry tomatoes packed with flavor and nutrients.',
      image_url: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg'
    },
    {
      id: 'prod-3',
      name: 'Fresh Basil',
      category: 'herbs',
      price: 279,
      stock: inventoryStock['prod-3'],
      image: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg',
      harvest_date: '2025-01-12',
      quality: 'Premium',
      rating: 4.9,
      description: 'Aromatic basil leaves perfect for cooking and garnishing.',
      image_url: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg'
    },
    {
      id: 'prod-4',
      name: 'Baby Spinach',
      category: 'leafy-greens',
      price: 439,
      stock: inventoryStock['prod-4'],
      image: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg',
      harvest_date: '2025-01-09',
      quality: 'Premium',
      rating: 4.7,
      description: 'Tender baby spinach leaves rich in iron and vitamins.',
      image_url: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg'
    },
    {
      id: 'prod-5',
      name: 'Mixed Herbs Bundle',
      category: 'herbs',
      price: 719,
      stock: inventoryStock['prod-5'],
      image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg',
      harvest_date: '2025-01-11',
      quality: 'Premium',
      rating: 4.8,
      description: 'Variety pack including basil, cilantro, parsley, and mint.',
      image_url: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg'
    },
    {
      id: 'prod-6',
      name: 'Cucumber',
      category: 'fruits',
      price: 239,
      stock: inventoryStock['prod-6'],
      image: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg',
      harvest_date: '2025-01-13',
      quality: 'Premium',
      rating: 4.6,
      description: 'Crisp, refreshing cucumbers perfect for salads and snacking.',
      image_url: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg'
    }
  ];

  // Get selling stock for each product
  const getSellingStock = (productId: string) => {
    const sellingItem = sellingItems.find(item => item.product.id === productId);
    return sellingItem ? sellingItem.quantity : 0;
  };

  const storageStats = [
    { name: 'Total Storage Capacity', value: '500 kg', icon: Package },
    { name: 'Current Stock', value: `${Object.values(inventoryStock).reduce((a, b) => a + b, 0)} units`, icon: TrendingUp },
    { name: 'This Month\'s Harvest', value: '125 kg', icon: Calendar },
    { name: 'Listed for Sale', value: `${sellingItems.reduce((sum, item) => sum + item.quantity, 0)} units`, icon: ShoppingCart }
  ];

  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' || product.category === filter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    addToCart(product, 1);
    // Show success message or toast
    alert(`${product.name} added to cart!`);
  };

  const handleSellClick = (product: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (product.stock <= 0) {
      alert('No stock available to sell!');
      return;
    }
    setQuantityModal({
      isOpen: true,
      product,
      action: 'sell',
      quantity: 1
    });
  };

  const handleReserveClick = (product: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (product.stock <= 0) {
      alert('No stock available to reserve!');
      return;
    }
    setQuantityModal({
      isOpen: true,
      product,
      action: 'reserve',
      quantity: 1
    });
  };

  const handleQuantitySubmit = () => {
    const { product, action, quantity } = quantityModal;
    
    if (quantity <= 0 || quantity > product.stock) {
      alert(`Please enter a valid quantity (1-${product.stock})`);
      return;
    }

    if (action === 'sell') {
      // Add to selling items and reduce inventory stock
      addToSelling(product, quantity);
      setInventoryStock(prev => ({
        ...prev,
        [product.id]: prev[product.id] - quantity
      }));
      alert(`${quantity} ${product.name}(s) listed for sale!`);
    } else if (action === 'reserve') {
      // Reserve stock (reduce from available inventory)
      setInventoryStock(prev => ({
        ...prev,
        [product.id]: prev[product.id] - quantity
      }));
      alert(`${quantity} ${product.name}(s) reserved from inventory!`);
    }

    setQuantityModal({
      isOpen: false,
      product: null,
      action: 'sell',
      quantity: 1
    });
  };

  const closeQuantityModal = () => {
    setQuantityModal({
      isOpen: false,
      product: null,
      action: 'sell',
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Storage & Inventory</h1>
          <p className="text-lg text-gray-600">Manage your harvest storage and sell your premium produce</p>
        </div>

        {/* Storage Stats */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Storage Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {storageStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.name}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Shop Products Section */}
        {sellingItems.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop - Listed for Sale</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sellingItems.map((sellingItem) => (
                <div key={`shop-${sellingItem.product.id}`} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-emerald-200">
                  <div className="relative">
                    <img 
                      src={sellingItem.product.image} 
                      alt={sellingItem.product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      For Sale
                    </div>
                    <div className="absolute bottom-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {sellingItem.quantity} Available
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{sellingItem.product.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{sellingItem.product.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{sellingItem.product.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-emerald-600">₹{sellingItem.product.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Available for Sale:</span>
                        <span className="font-medium text-emerald-600">{sellingItem.quantity} units</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Harvest Date:</span>
                        <span className="font-medium">{new Date(sellingItem.product.harvest_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleAddToCart(sellingItem.product)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Buy Now</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Remove ${sellingItem.product.name} from shop?`)) {
                            // Return stock to inventory
                            setInventoryStock(prev => ({
                              ...prev,
                              [sellingItem.product.id]: prev[sellingItem.product.id] + sellingItem.quantity
                            }));
                            // Remove from selling items
                            removeFromSelling(sellingItem.product.id);
                          }
                        }}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filters and Search */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="leafy-greens">Leafy Greens</option>
                    <option value="herbs">Herbs</option>
                    <option value="fruits">Fruits & Vegetables</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory - Available Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.quality}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Local Farm
                  </div>
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{product.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                       <span className="font-semibold text-emerald-600">₹{product.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock:</span>
                       <span className={`font-medium ${product.stock <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
                         {product.stock} units
                       </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Listed for Sale:</span>
                      <span className="font-medium text-emerald-600">{getSellingStock(product.id)} units</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Harvest Date:</span>
                       <span className="font-medium">{new Date(product.harvest_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleSellClick(product)}
                      disabled={product.stock <= 0}
                      className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-1"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>List to Sell</span>
                    </button>
                    <button 
                      onClick={() => handleReserveClick(product)}
                      disabled={product.stock <= 0}
                      className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-1"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Reserve Stock</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Sales */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Sales Activity</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { product: 'Organic Lettuce', quantity: '2.5 kg', price: '₹997', buyer: 'Green Valley Restaurant', date: '2025-01-10', status: 'Delivered' },
                    { product: 'Cherry Tomatoes', quantity: '1.5 kg', price: '₹839', buyer: 'Local Market Co.', date: '2025-01-09', status: 'In Transit' },
                    { product: 'Mixed Herbs', quantity: '8 bundles', price: '₹5,752', buyer: 'Farm Fresh Grocers', date: '2025-01-08', status: 'Delivered' },
                    { product: 'Baby Spinach', quantity: '2 kg', price: '₹878', buyer: 'Healthy Eats Cafe', date: '2025-01-07', status: 'Delivered' }
                  ].map((sale, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{sale.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.buyer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sale.status === 'Delivered' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* Quantity Modal */}
        {quantityModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {quantityModal.action === 'sell' ? 'List for Sale' : 'Reserve Stock'}
                </h3>
                <button
                  onClick={closeQuantityModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={quantityModal.product?.image}
                    alt={quantityModal.product?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {quantityModal.product?.name}
                    </h4>
                    <p className="text-gray-600">Available: {quantityModal.product?.stock} units</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity {quantityModal.action === 'sell' ? 'to List' : 'to Reserve'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={quantityModal.product?.stock}
                    value={quantityModal.quantity}
                    onChange={(e) => setQuantityModal({
                      ...quantityModal,
                      quantity: parseInt(e.target.value) || 1
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {quantityModal.product?.stock} units
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={closeQuantityModal}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuantitySubmit}
                    className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium text-white ${
                      quantityModal.action === 'sell' 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {quantityModal.action === 'sell' ? 'List for Sale' : 'Reserve Stock'}
                  </button>
                </div>
              </div>
            </div>
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

export default Marketplace;