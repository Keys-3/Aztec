import React from 'react';
import { X, TrendingUp, BarChart2, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const yieldData = [
  { month: 'Jan', yield: 120 },
  { month: 'Feb', yield: 150 },
  { month: 'Mar', yield: 180 },
  { month: 'Apr', yield: 170 },
  { month: 'May', yield: 210 },
  { month: 'Jun', yield: 250 },
];

const efficiencyData = [
  { day: 'Mon', power: 45, water: 80 },
  { day: 'Tue', power: 52, water: 85 },
  { day: 'Wed', power: 48, water: 82 },
  { day: 'Thu', power: 50, water: 88 },
  { day: 'Fri', power: 46, water: 79 },
  { day: 'Sat', power: 42, water: 75 },
  { day: 'Sun', power: 44, water: 76 },
];

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-5xl h-[90vh] border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-emerald-600/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600/20 rounded-xl">
              <BarChart2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
              <p className="text-emerald-400/80">Comprehensive Farm Performance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-gray-600 font-medium mb-2">Total Yield (YTD)</h3>
              <div className="flex items-end space-x-2">
                <span className="text-4xl font-bold text-gray-900">1,080</span>
                <span className="text-emerald-400 flex items-center text-sm mb-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12%
                </span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-gray-600 font-medium mb-2">Avg Growth Cycle</h3>
              <div className="flex items-end space-x-2">
                <span className="text-4xl font-bold text-gray-900">32</span>
                <span className="text-gray-600 mb-1">days</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-gray-600 font-medium mb-2">Resource Efficiency</h3>
              <div className="flex items-end space-x-2">
                <span className="text-4xl font-bold text-gray-900">94</span>
                <span className="text-gray-600 mb-1">/ 100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Yield Output (kg)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                    <Area type="monotone" dataKey="yield" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Resource Usage</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                    <Bar dataKey="power" fill="#3B82F6" name="Power (kWh)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="water" fill="#0EA5E9" name="Water (L)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
