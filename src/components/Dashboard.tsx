import React from 'react';
import { Thermometer, Droplets, Zap, Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, Wifi, Battery, Settings, RefreshCw, Eye, BarChart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AuthModal from './AuthModal';

const Dashboard: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleBuyClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      // Add sample product to cart
      const sampleProduct = {
        id: 'sample-1',
        name: 'Fresh Lettuce',
        category: 'leafy-greens',
        price: 399,
        stock: 25,
        image_url: 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg',
        description: 'Fresh, crisp lettuce grown in our hydroponic system.',
        harvest_date: '2025-01-10',
        quality: 'Premium',
        rating: 4.9,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      addToCart(sampleProduct, 1);
      alert('Product added to cart!');
    }
  };

  const sensorData = [
    { 
      id: 'temperature',
      name: 'Temperature', 
      value: '24.5°C', 
      status: 'optimal', 
      icon: Thermometer,
      trend: '+0.2°C from yesterday',
      range: '20-26°C optimal',
      percentage: 85,
      color: 'emerald'
    },
    { 
      id: 'humidity',
      name: 'Humidity', 
      value: '65%', 
      status: 'good', 
      icon: Droplets,
      trend: '-2% from yesterday',
      range: '60-70% optimal',
      percentage: 75,
      color: 'blue'
    },
    { 
      id: 'ph',
      name: 'pH Level', 
      value: '6.2', 
      status: 'optimal', 
      icon: Activity,
      trend: '+0.1 from yesterday',
      range: '5.5-6.5 optimal',
      percentage: 92,
      color: 'purple'
    },
    { 
      id: 'ec',
      name: 'Electrical Conductivity', 
      value: '1.8 mS/cm', 
      status: 'good', 
      icon: Zap,
      trend: 'Stable',
      range: '1.2-2.0 optimal',
      percentage: 80,
      color: 'amber'
    }
  ];

  const systemStatus = [
    { name: 'Water Pump', status: 'running', lastMaintenance: '2 days ago' },
    { name: 'LED Grow Lights', status: 'running', lastMaintenance: '1 week ago' },
    { name: 'Nutrient Dosing', status: 'running', lastMaintenance: '3 days ago' },
    { name: 'Ventilation Fan', status: 'running', lastMaintenance: '5 days ago' },
    { name: 'pH Controller', status: 'warning', lastMaintenance: '2 weeks ago' },
    { name: 'Temperature Control', status: 'running', lastMaintenance: '1 day ago' },
  ];

  const plantMetrics = [
    { plant: 'Lettuce - Zone A', growth: '92%', health: 'Excellent', harvestDate: '3 days' },
    { plant: 'Tomatoes - Zone B', growth: '78%', health: 'Good', harvestDate: '2 weeks' },
    { plant: 'Herbs - Zone C', growth: '85%', health: 'Excellent', harvestDate: '1 week' },
    { plant: 'Spinach - Zone D', growth: '95%', health: 'Excellent', harvestDate: '2 days' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-emerald-600 bg-emerald-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-amber-600 bg-amber-100';
      case 'running': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'running':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">System Dashboard</h1>
              <p className="text-lg text-emerald-100">Real-time monitoring and analytics for your hydroponic system</p>
              <div className="flex items-center mt-4 text-sm text-emerald-200">
                <Clock className="h-4 w-4 mr-2" />
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex space-x-4">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Wifi className="h-5 w-5 text-emerald-200" />
                <span className="text-sm">Connected</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Battery className="h-5 w-5 text-emerald-200" />
                <span className="text-sm">98%</span>
              </div>
              <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/30 transition-all">
                <RefreshCw className="h-5 w-5 text-emerald-200" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sensor Readings */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Environmental Conditions</h2>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-all">
                <Eye className="h-4 w-4" />
                <span className="text-sm">View Details</span>
              </button>
              <button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-all">
                <BarChart className="h-4 w-4" />
                <span className="text-sm">Analytics</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sensorData.map((sensor) => {
              const Icon = sensor.icon;
              const getColorClasses = (color: string) => {
                const colors = {
                  emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-100',
                  blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-100',
                  purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-100',
                  amber: 'from-amber-500 to-amber-600 text-amber-600 bg-amber-100'
                };
                return colors[color as keyof typeof colors] || colors.emerald;
              };
              
              return (
                <div key={sensor.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${getColorClasses(sensor.color).split(' ')[0]} ${getColorClasses(sensor.color).split(' ')[1]}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(sensor.status)}`}>
                      {getStatusIcon(sensor.status)}
                      <span className="capitalize">{sensor.status}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{sensor.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-3">{sensor.value}</div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Performance</span>
                      <span>{sensor.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(sensor.color).split(' ')[0]} ${getColorClasses(sensor.color).split(' ')[1]} transition-all duration-500`}
                        style={{ width: `${sensor.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {sensor.trend}
                  </div>
                  <div className="text-xs text-gray-500">{sensor.range}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Plant Health Metrics */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Plant Health & Growth</h2>
            <button className="flex items-center space-x-2 bg-emerald-600 text-white rounded-lg px-4 py-2 hover:bg-emerald-700 transition-all">
              <Settings className="h-4 w-4" />
              <span className="text-sm">Manage Plants</span>
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant & Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Harvest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plantMetrics.map((plant, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Activity className="h-5 w-5 text-emerald-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{plant.plant}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: plant.growth }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{plant.growth}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plant.health === 'Excellent' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {plant.health}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plant.harvestDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={handleBuyClick}
                          className="bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center space-x-1"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          <span>Ready</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">System Components</h2>
            <div className="text-sm text-gray-600">
              <span className="text-emerald-600 font-semibold">5</span> Running • 
              <span className="text-amber-600 font-semibold">1</span> Warning
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemStatus.map((component, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(component.status)}`}>
                    {getStatusIcon(component.status)}
                    <span className="capitalize">{component.status}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Last maintenance:</span>
                    <span className="font-medium">{component.lastMaintenance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Production Overview</h2>
            <div className="text-sm text-gray-600">Updated every 5 minutes</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">145</div>
                  <div className="text-emerald-100">Plants Growing</div>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-200" />
              </div>
              <div className="mt-4 text-xs text-emerald-200">+12 this week</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">1,247L</div>
                  <div className="text-blue-100">Water Saved</div>
                </div>
                <Droplets className="h-8 w-8 text-blue-200" />
              </div>
              <div className="mt-4 text-xs text-blue-200">vs traditional farming</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">18.5kg</div>
                  <div className="text-amber-100">This Month's Yield</div>
                </div>
                <Activity className="h-8 w-8 text-amber-200" />
              </div>
              <div className="mt-4 text-xs text-amber-200">+15% from last month</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">97.8%</div>
                  <div className="text-purple-100">System Uptime</div>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-200" />
              </div>
              <div className="mt-4 text-xs text-purple-200">Last 30 days</div>
            </div>
          </div>
        </section>
        
        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default Dashboard;