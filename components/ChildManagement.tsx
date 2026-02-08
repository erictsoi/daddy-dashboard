import React, { useState } from 'react';
import { ChildProfile, YearGroup, Subject, Lesson } from '../types';
import { Plus, X, Edit2, Save, Trash2, GripVertical } from 'lucide-react';

const AVATARS = ['👶', '🧒', '👦', '👧', '🧑‍🦰', '👱', '🧒', '👦', '👧', '🧒', '👦', '👧', '🧑', '👨‍🦱', '👩‍🦱', '🧑‍🦳', '👨‍🦳', '👩‍🦳', '🧑‍🦲', '👨‍🦲', '👩‍🦲', '🧔', '👨', '👩', '🧑‍🚀', '👩‍🚀', '🧑‍🔬', '👩‍🔬', '🧑‍🎨', '👩‍🎨', '🧑‍🏫', '👩‍🏫', '🧑‍⚕️', '👩‍⚕️', '🧑‍🌾', '👩‍🌾', '🧑‍🍳', '👩‍🍳', '🧑‍🎤', '👩‍🎤', '🧑‍🎭', '👩‍🎭', '🧑‍🚒', '👩‍🚒', '🧑‍✈️', '👩‍✈️', '🧑‍🚀', '👩‍🚀', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🧙', '🧙‍♀️', '🧚', '🧚‍♀️', '🧛', '🧛‍♀️', '🧜', '🧜‍♀️', '🧝', '🧝‍♀️', '🧞', '🧞‍♀️', '🧟', '🧟‍♀️', '👼', '🎅', '🤶', '🦸‍♂️', '🦹‍♂️', '🧙‍♂️', '🧚‍♂️', '🧛‍♂️', '🧜‍♂️', '🧝‍♂️', '🧞‍♂️', '🧟‍♂️'];

const THEME_COLORS = [
  { name: 'Blue', class: 'blue', bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500' },
  { name: 'Indigo', class: 'indigo', bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-500' },
  { name: 'Purple', class: 'purple', bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500' },
  { name: 'Pink', class: 'pink', bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-500' },
  { name: 'Rose', class: 'rose', bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-500' },
  { name: 'Red', class: 'red', bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600', border: 'border-red-500' },
  { name: 'Orange', class: 'orange', bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500' },
  { name: 'Amber', class: 'amber', bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-500' },
  { name: 'Yellow', class: 'yellow', bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-500' },
  { name: 'Green', class: 'green', bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-500' },
  { name: 'Emerald', class: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-500' },
  { name: 'Teal', class: 'teal', bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-500' },
  { name: 'Cyan', class: 'cyan', bg: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-500' },
  { name: 'Sky', class: 'sky', bg: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-500' },
];

interface ChildFormData {
  name: string;
  avatar: string;
  themeColor: string;
  dob: string;
  googleEmail: string;
}

interface ChildManagementProps {
  children: ChildProfile[];
  onAddChild: (child: Omit<ChildProfile, 'id' | 'yearGroups'>) => void;
  onUpdateChild: (id: string, child: Omit<ChildProfile, 'id' | 'yearGroups'>) => void;
  onDeleteChild: (id: string) => void;
  onClose: () => void;
}

export const ChildManagement: React.FC<ChildManagementProps> = ({
  children,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    avatar: '👶',
    themeColor: 'blue',
    dob: '',
    googleEmail: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      avatar: '👶',
      themeColor: 'blue',
      dob: '',
      googleEmail: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      onAddChild({
        name: formData.name,
        avatar: formData.avatar,
        themeColor: formData.themeColor,
        dob: formData.dob,
      });
    } else if (editingId) {
      onUpdateChild(editingId, {
        name: formData.name,
        avatar: formData.avatar,
        themeColor: formData.themeColor,
        dob: formData.dob,
      });
    }
    resetForm();
  };

  const startEdit = (child: ChildProfile) => {
    setFormData({
      name: child.name,
      avatar: child.avatar,
      themeColor: child.themeColor,
      dob: child.dob,
      googleEmail: '',
    });
    setEditingId(child.id);
    setIsAdding(false);
  };

  const getThemeColor = (themeColor: string) => {
    return THEME_COLORS.find(c => c.class === themeColor) || THEME_COLORS[0];
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
              const theme = getThemeColor(child.themeColor);
              return (
                <div
                  key={child.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 ${theme.border} ${theme.light}`}
                >
                  <div className={`w-16 h-16 rounded-full ${theme.bg} flex items-center justify-center text-3xl`}>
                    {child.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{child.name}</h3>
                    {child.dob && (
                      <p className="text-sm text-gray-500">DOB: {child.dob}</p>
                    )}
                    <p className="text-sm text-gray-400">
                      {child.yearGroups.length} year groups,{' '}
                      {child.yearGroups.reduce((acc, yg) => acc + yg.subjects.length, 0)} subjects
                    </p>
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
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.slice(0, 40).map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                        formData.avatar === avatar
                          ? 'bg-blue-100 ring-2 ring-blue-500'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                <div className="flex flex-wrap gap-2">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.class}
                      type="button"
                      onClick={() => setFormData({ ...formData, themeColor: color.class })}
                      className={`w-10 h-10 rounded-lg ${color.bg} transition ${
                        formData.themeColor === color.class
                          ? 'ring-2 ring-offset-2 ring-gray-400'
                          : ''
                      }`}
                      title={color.name}
                    />
                  ))}
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
                  Link child's Google account for YouTube recommendations based on their watch history
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save size={20} />
                  {isAdding ? 'Add Child' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
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
