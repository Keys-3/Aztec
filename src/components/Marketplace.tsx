import React, { useState } from 'react';
import { Package, TrendingUp, Calendar, MapPin, Filter, Search, Star, ShoppingCart } from 'lucide-react';

const Marketplace: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    {
      id: 1,
      name: 'Organic Lettuce',
      category: 'leafy-greens',
      price: '₹399/kg',
      stock: 25,
      image: 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg',
      harvestDate: '2025-01-10',
      quality: 'Premium',
      rating: 4.9,
      description: 'Fresh, crisp lettuce grown in our state-of-the-art hydroponic system.'
    },
    {
      id: 2,
      name: 'Cherry Tomatoes',
      category: 'fruits',
      price: '₹559/kg',
      stock: 18,
      image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
      harvestDate: '2025-01-08',
      quality: 'Premium',
      rating: 4.8,
      description: 'Sweet, vine-ripened cherry tomatoes packed with flavor and nutrients.'
    },
    {
      id: 3,
      name: 'Fresh Basil',
      category: 'herbs',
      price: '₹279/bunch',
      stock: 32,
      image: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg',
      harvestDate: '2025-01-12',
      quality: 'Premium',
      rating: 4.9,
      description: 'Aromatic basil leaves perfect for cooking and garnishing.'
    },
    {
      id: 4,
      name: 'Baby Spinach',
      category: 'leafy-greens',
      price: '₹439/kg',
      stock: 22,
      image: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg',
      harvestDate: '2025-01-09',
      quality: 'Premium',
      rating: 4.7,
      description: 'Tender baby spinach leaves rich in iron and vitamins.'
    },
    {
      id: 5,
      name: 'Mixed Herbs Bundle',
      category: 'herbs',
      price: '₹719/bundle',
      stock: 15,
      image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg',
      harvestDate: '2025-01-11',
      quality: 'Premium',
      rating: 4.8,
      description: 'Variety pack including basil, cilantro, parsley, and mint.'
    },
    {
      id: 6,
      name: 'Cucumber',
      category: 'fruits',
      price: '₹239/each',
      stock: 28,
      image: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg',
      harvestDate: '2025-01-13',
      quality: 'Premium',
      rating: 4.6,
      description: 'Crisp, refreshing cucumbers perfect for salads and snacking.'
    }
  ];

  const storageStats = [
    { name: 'Total Storage Capacity', value: '500 kg', icon: Package },
    { name: 'Current Stock', value: '340 kg', icon: TrendingUp },
    { name: 'This Month\'s Harvest', value: '125 kg', icon: Calendar },
    { name: 'Available for Sale', value: '280 kg', icon: ShoppingCart }
  ];

  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' || product.category === filter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Storage & Marketplace</h1>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Products</h2>
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
                      <span className="font-semibold text-emerald-600">{product.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium">{product.stock} units</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Harvest Date:</span>
                      <span className="font-medium">{new Date(product.harvestDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                      List for Sale
                    </button>
                    <button className="flex-1 border border-emerald-600 text-emerald-600 py-2 px-4 rounded-lg hover:bg-emerald-50 transition-colors font-medium">
                      Reserve Stock
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
      </div>
    </div>
  );
};

export default Marketplace;