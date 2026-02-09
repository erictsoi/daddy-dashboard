import React, { useState } from 'react';
import { ChildProfile, YearGroup } from '../types';
import { Plus, X, Edit2, Save, Trash2 } from 'lucide-react';
import { calculateSchoolYear } from './EditProfile';

interface ChildFormData {
  name: string;
  dob: string;
  googleEmail: string;
}

interface YearGroupFormData {
  name: string;
}

interface ChildManagementProps {
  children: ChildProfile[];
  onAddChild: (child: Omit<ChildProfile, 'id' | 'yearGroups'>) => void;
  onUpdateChild: (id: string, child: Omit<ChildProfile, 'id' | 'yearGroups'>) => void;
  onDeleteChild: (id: string) => void;
  onAddYearGroup: (childId: string, name: string) => void;
  onRemoveYearGroup: (childId: string, yearGroupId: string) => void;
  onClose: () => void;
}

export const ChildManagement: React.FC<ChildManagementProps> = ({
  children,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onAddYearGroup,
  onRemoveYearGroup,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showYearGroups, setShowYearGroups] = useState<string | null>(null);
  const [newYearGroup, setNewYearGroup] = useState('');
  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    dob: '',
    googleEmail: '',
  });

  const resetForm = () => {
    setFormData({ name: '', dob: '', googleEmail: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      onAddChild({
        name: formData.name,
        avatar: '👶',
        themeColor: 'blue',
        dob: formData.dob,
      });
    } else if (editingId) {
      onUpdateChild(editingId, {
        name: formData.name,
        avatar: children.find(c => c.id === editingId)?.avatar || '👶',
        themeColor: children.find(c => c.id === editingId)?.themeColor || 'blue',
        dob: formData.dob,
      });
    }
    resetForm();
  };

  const startEdit = (child: ChildProfile) => {
    setFormData({
      name: child.name,
      dob: child.dob,
      googleEmail: '',
    });
    setEditingId(child.id);
    setIsAdding(false);
  };

  const handleAddYearGroup = (childId: string) => {
    if (newYearGroup.trim()) {
      onAddYearGroup(childId, newYearGroup.trim());
      setNewYearGroup('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Manage Children</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid gap-4 mb-6">
            {children.map((child) => {
              const suggestedYear = calculateSchoolYear(child.dob);
              return (
                <div
                  key={child.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-${child.themeColor}-100`}>
                    {child.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{child.name}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                      {child.dob && (
                        <span>DOB: {child.dob}</span>
                      )}
                      {suggestedYear && (
                        <span className="text-green-600">Suggested: {suggestedYear}</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {child.yearGroups.map((yg) => (
                          <span
                            key={yg.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-full text-xs"
                          >
                            {yg.name}
                            <button
                              onClick={() => onRemoveYearGroup(child.id, yg.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        {showYearGroups === child.id ? (
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="text"
                              value={newYearGroup}
                              onChange={(e) => setNewYearGroup(e.target.value)}
                              placeholder="Year (e.g., Year 5)"
                              className="w-32 px-2 py-1 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddYearGroup(child.id)}
                            />
                            <button
                              onClick={() => handleAddYearGroup(child.id)}
                              disabled={!newYearGroup.trim()}
                              className="px-2 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 disabled:opacity-50"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => { setShowYearGroups(null); setNewYearGroup(''); }}
                              className="px-2 py-1 bg-gray-300 text-gray-600 rounded-full text-xs hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowYearGroups(child.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs hover:bg-blue-100"
                          >
                            <Plus size={12} /> Add Year
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(child)}
                      className="p-2 hover:bg-white rounded-lg transition"
                    >
                      <Edit2 size={20} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${child.name} and all their data?`)) {
                          onDeleteChild(child.id);
                        }
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                    >
                      <Trash2 size={20} className="text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {(isAdding || editingId) && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-4">
                {isAdding ? 'Add New Child' : `Edit ${formData.name}`}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {formData.dob && (
                    <p className="text-xs text-green-600 mt-1">
                      Suggested year: {calculateSchoolYear(formData.dob)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Email (optional - for personalized recommendations)
                </label>
                <input
                  type="email"
                  value={formData.googleEmail}
                  onChange={(e) => setFormData({ ...formData, googleEmail: e.target.value })}
                  placeholder="child@gmail.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link child's Google account for personalized YouTube recommendations
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save size={20} />
                  {isAdding ? 'Add Child' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!isAdding && !editingId && (
            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition flex items-center justify-center gap-2"
            >
              <Plus size={24} />
              Add New Child
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildManagement;
