import React, { useState, useEffect } from 'react';
import { X, User, Settings, Shield, HelpCircle, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'profile' | 'dashboard' | 'legal' | 'faq';

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  
  // Profile State
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Dashboard Preferences State
  const [selectedSensors, setSelectedSensors] = useState<string[]>(['temperature', 'humidity', 'ph', 'ec', 'light', 'co2', 'water_temp', 'do']);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setContact(user.contact || '');
      setAddressLine1(user.address_line_1 || '');
      setAddressLine2(user.address_line_2 || '');
      setCity(user.city || '');
      setState(user.state || '');
      setPostalCode(user.postal_code || '');
      setCountry(user.country || 'India');
      
      // Load saved preferences
      const savedSensors = localStorage.getItem(`aztec-dashboard-sensors-${user.id}`);
      if (savedSensors) {
        setSelectedSensors(JSON.parse(savedSensors));
      }
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await updateProfile({ 
      username, 
      contact,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city,
      state,
      postal_code: postalCode,
      country
    });
    setIsSaving(false);
    
    if (error) {
      showMessage('error', 'Failed to update profile');
    } else {
      showMessage('success', 'Profile updated successfully!');
    }
  };

  const toggleSensor = (sensorId: string) => {
    const newSensors = selectedSensors.includes(sensorId)
      ? selectedSensors.filter(id => id !== sensorId)
      : [...selectedSensors, sensorId];
      
    setSelectedSensors(newSensors);
    localStorage.setItem(`aztec-dashboard-sensors-${user.id}`, JSON.stringify(newSensors));
    showMessage('success', 'Dashboard preferences saved!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    ...(user.role === 'farmer' || user.role === 'admin' ? [{ id: 'dashboard', label: 'Dashboard Preferences', icon: Settings }] : []),
    { id: 'legal', label: 'Legal Policies', icon: Shield },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between md:justify-start">
            <h2 className="text-xl font-bold text-gray-900">Account</h2>
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white relative">
          <button onClick={onClose} className="hidden md:block absolute top-6 right-6 text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
          
          <div className="p-8 max-w-2xl mx-auto">
            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h3>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={user.email} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <input type="tel" value={contact} onChange={e => setContact(e.target.value)} required className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Address Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                        <input type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="Street address, P.O. box, etc." className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                        <input type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Apartment, suite, unit, etc." className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                          <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal / Zip Code</label>
                          <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg">
                    <Save className="h-5 w-5" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* Dashboard Preferences */}
            {activeTab === 'dashboard' && (user.role === 'farmer' || user.role === 'admin') && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Preferences</h3>
                <p className="text-gray-600 mb-6">Select which sensors you want to monitor on your dashboard.</p>
                <div className="space-y-4">
                  {[
                    { id: 'temperature', name: 'Temperature' },
                    { id: 'humidity', name: 'Humidity' },
                    { id: 'ph', name: 'pH Level' },
                    { id: 'ec', name: 'Electrical Conductivity (EC)' },
                    { id: 'light', name: 'Light Intensity' },
                    { id: 'co2', name: 'CO2 Levels' },
                    { id: 'water_temp', name: 'Water Temperature' },
                    { id: 'do', name: 'Dissolved Oxygen' }
                  ].map(sensor => (
                    <label key={sensor.id} className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm">
                      <input 
                        type="checkbox" 
                        checked={selectedSensors.includes(sensor.id)}
                        onChange={() => toggleSensor(sensor.id)}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="ml-3 font-medium text-gray-900">{sensor.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Policies */}
            {activeTab === 'legal' && (
              <div className="space-y-8 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Legal Policies</h3>
                
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Terms of Service</h4>
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Welcome to Aztec Hydroponics. By accessing our platform, you agree to these terms. Our marketplace connects farmers with customers. We are not responsible for the quality of produce sold, though we enforce strict guidelines.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Users must provide accurate information and respect the community guidelines. Any fraudulent activity will result in immediate account termination.
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Privacy Policy</h4>
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Your privacy is important to us. We collect necessary data (email, address, contact) solely for processing orders and managing your account. We do not sell your data to third parties.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Financial transactions are handled by secure third-party payment gateways. We do not store your credit card information on our servers.
                    </p>
                  </div>
                </section>
              </div>
            )}

            {/* FAQ */}
            {activeTab === 'faq' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {[
                    { q: "How do I become a seller?", a: "To become a seller, register a new account and select 'Farmer' as your role. You will immediately get access to the Dashboard and Inventory management tools." },
                    { q: "What is the return policy?", a: "You can return delivered items within 24 hours of receipt if they are damaged or not as described. Use the 'Return Order' button in your Order History." },
                    { q: "How do I track my order?", a: "Go to your Profile > My Orders, and click on an order to see its current status on the tracking timeline." },
                    { q: "How does the hydroponic dashboard work?", a: "The dashboard connects to your IoT sensors. You can customize which sensors you want to see here in Account Settings." }
                  ].map((faq, i) => (
                    <div key={i} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-200 transition-colors">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs mr-2">Q</span>
                        {faq.q}
                      </h4>
                      <p className="text-gray-600 leading-relaxed pl-8">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
