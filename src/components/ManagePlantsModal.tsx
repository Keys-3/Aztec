import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Leaf, Save } from 'lucide-react';

interface Plant {
  id: string;
  plant: string;
  planted: string;
  harvestDate: string;
  status: string;
  growth: string;
  health: string;
}

interface ManagePlantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plants: Plant[];
  setPlants: (plants: Plant[]) => void;
}

const ManagePlantsModal: React.FC<ManagePlantsModalProps> = ({ isOpen, onClose, plants = [], setPlants }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Plant | null>(null);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this crop zone?')) {
      setPlants(plants.filter(p => p.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleAdd = () => {
    const newId = Date.now().toString();
    const newPlant: Plant = {
      id: newId,
      plant: 'New Crop Zone',
      planted: new Date().toISOString().split('T')[0],
      harvestDate: '',
      status: 'Growing',
      growth: '0%',
      health: 'Good'
    };
    setPlants([...plants, newPlant]);
    setEditingId(newId);
    setEditForm(newPlant);
  };

  const handleEdit = (plant: Plant) => {
    setEditingId(plant.id);
    setEditForm({ ...plant });
  };

  const handleSave = () => {
    if (editForm) {
      setPlants(plants.map(p => p.id === editingId ? editForm : p));
    }
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-4xl max-h-[90vh] border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600/20 rounded-xl">
              <Leaf className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Plants</h2>
              <p className="text-gray-600">View and edit active crop zones</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-end mb-6">
            <button 
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Crop Zone</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Crop / Zone</th>
                  <th className="px-6 py-4 font-medium">Planted Date</th>
                  <th className="px-6 py-4 font-medium">Est. Harvest</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plants.map((p) => {
                  if (editingId === p.id && editForm) {
                    return (
                      <tr key={p.id} className="bg-emerald-50">
                        <td className="px-4 py-4">
                          <input 
                            type="text" 
                            value={editForm.plant}
                            onChange={(e) => setEditForm({...editForm, plant: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="date" 
                            value={editForm.planted}
                            onChange={(e) => setEditForm({...editForm, planted: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="date" 
                            value={editForm.harvestDate}
                            onChange={(e) => setEditForm({...editForm, harvestDate: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <select 
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                          >
                            <option value="Growing">Growing</option>
                            <option value="Ready">Ready</option>
                            <option value="Harvested">Harvested</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                          <button 
                            onClick={handleSave}
                            className="text-emerald-600 hover:text-emerald-800 transition-colors"
                            title="Save"
                          >
                            <Save className="h-5 w-5 inline" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="text-gray-600 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{p.plant}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{p.planted}</td>
                      <td className="px-6 py-4 text-gray-700">{p.harvestDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          p.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Edit2 className="h-5 w-5 inline" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {plants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No plants found. Click "Add New Crop Zone" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePlantsModal;
