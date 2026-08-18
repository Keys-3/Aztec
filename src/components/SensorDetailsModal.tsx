import React from 'react';
import { X, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensor: {
    name: string;
    value: string;
    status: string;
    icon: React.ElementType;
    color: string;
  } | null;
}

const generateMockData = (sensorName: string) => {
  const data = [];
  let baseValue = 0;
  let variance = 0;

  switch (sensorName.toLowerCase()) {
    case 'temperature': baseValue = 22; variance = 2; break;
    case 'humidity': baseValue = 60; variance = 5; break;
    case 'ph level': baseValue = 6.2; variance = 0.3; break;
    case 'nutrient ec': baseValue = 1.8; variance = 0.1; break;
    case 'light intensity': baseValue = 400; variance = 50; break;
    case 'co2 levels': baseValue = 450; variance = 30; break;
    case 'water temp': baseValue = 20; variance = 1.5; break;
    case 'dissolved o2': baseValue = 8.5; variance = 0.5; break;
    default: baseValue = 50; variance = 10;
  }

  for (let i = 24; i >= 0; i--) {
    const time = new Date();
    time.setHours(time.getHours() - i);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Number((baseValue + (Math.random() * variance * 2 - variance)).toFixed(1))
    });
  }
  return data;
};

const SensorDetailsModal: React.FC<SensorDetailsModalProps> = ({ isOpen, onClose, sensor }) => {
  if (!isOpen || !sensor) return null;

  const mockData = generateMockData(sensor.name);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 flex items-center justify-between ${sensor.color}`}>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <sensor.icon className="h-6 w-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{sensor.name} Details</h2>
              <p className="text-gray-900/70">Current Value: {sensor.value}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-900/70 hover:text-gray-900 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">24h Average</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {(mockData.reduce((acc, curr) => acc + curr.value, 0) / mockData.length).toFixed(1)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <span className={`text-xl font-bold ${sensor.status === 'Optimal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {sensor.status}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">24-Hour History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                  <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
                    itemStyle={{ color: '#10B981' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SensorDetailsModal;
