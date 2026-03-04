import React, { useState } from 'react';
import { ChildProfile } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const AVATARS = ['👶', '🧒', '👦', '👧', '🧑‍🦰', '👱', '🧑', '👨‍🦱', '👩‍🦱', '🧑‍🦳', '👨‍🦳', '👩‍🦳', '🧑‍🦲', '👨‍🦲', '👩‍🦲', '🧔', '👨', '👩', '🧑‍🚀', '👩‍🚀', '🧑‍🔬', '👩‍🔬', '🧑‍🎨', '👩‍🎨', '🧑‍🏫', '👩‍🏫', '🧑‍⚕️', '👩‍⚕️', '🧑‍🌾', '👩‍🌾', '🧑‍🍳', '👩‍🍳', '🧑‍🎤', '👩‍🎤', '🧑‍🎭', '👩‍🎭', '🧑‍🚒', '👩‍🚒', '🧑‍✈️', '👩‍✈️', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🧙', '🧙‍♀️', '🧚', '🧚‍♀️', '🧛', '🧛‍♀️', '🧜', '🧜‍♀️', '🧝', '🧝‍♀️', '🧞', '🧞‍♀️', '🧟', '🧟‍♀️', '👼', '🎅', '🤶', '🦸‍♂️', '🦹‍♂️', '🧙‍♂️', '🧚‍♂️', '🧛‍♂️', '🧜‍♂️', '🧝‍♂️', '🧞‍♂️', '🧟‍♂️'];

const THEME_COLORS = [
  { name: 'Blue', class: 'blue', bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500', header: 'bg-blue-600' },
  { name: 'Indigo', class: 'indigo', bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-500', header: 'bg-indigo-600' },
  { name: 'Purple', class: 'purple', bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500', header: 'bg-purple-600' },
  { name: 'Pink', class: 'pink', bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-500', header: 'bg-pink-600' },
  { name: 'Rose', class: 'rose', bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-500', header: 'bg-rose-600' },
  { name: 'Red', class: 'red', bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600', border: 'border-red-500', header: 'bg-red-600' },
  { name: 'Orange', class: 'orange', bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500', header: 'bg-orange-600' },
  { name: 'Amber', class: 'amber', bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-500', header: 'bg-amber-600' },
  { name: 'Yellow', class: 'yellow', bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-500', header: 'bg-yellow-600' },
  { name: 'Green', class: 'green', bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-500', header: 'bg-green-600' },
  { name: 'Emerald', class: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-500', header: 'bg-emerald-600' },
  { name: 'Teal', class: 'teal', bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-500', header: 'bg-teal-600' },
  { name: 'Cyan', class: 'cyan', bg: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-500', header: 'bg-cyan-600' },
  { name: 'Sky', class: 'sky', bg: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-500', header: 'bg-sky-600' },
];

interface EditProfileProps {
  child: ChildProfile;
  onSave: (updates: Partial<ChildProfile>) => void;
  onClose: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ child, onSave, onClose }) => {
  const [name, setName] = useState(child.name);
  const [avatar, setAvatar] = useState(child.avatar);
  const [themeColor, setThemeColor] = useState(child.themeColor);
  const [googleEmail, setGoogleEmail] = useState(child.googleEmail || '');
  const [avatarPage, setAvatarPage] = useState(0);
  const AVATARS_PER_PAGE = 20;
  const totalPages = Math.ceil(AVATARS.length / AVATARS_PER_PAGE);

  const handleSave = () => {
    onSave({
      name,
      avatar,
      themeColor,
      googleEmail: googleEmail.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Avatar Preview */}
          <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl ${THEME_COLORS.find(c => c.class === themeColor)?.light}`}>
              {avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{name || 'Your Name'}</h3>
              <p className="text-gray-500">
                {child.yearGroups.map(yg => yg.name).join(', ') || 'No year groups'}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* Avatar Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${THEME_COLORS.find(c => c.class === themeColor)?.light}`}>
                  {avatar}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {AVATARS.slice(avatarPage * AVATARS_PER_PAGE, (avatarPage + 1) * AVATARS_PER_PAGE).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition ${
                      avatar === a
                        ? 'bg-blue-100 ring-2 ring-blue-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => setAvatarPage(p => Math.max(0, p - 1))}
                    disabled={avatarPage === 0}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-gray-500">
                    {avatarPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setAvatarPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={avatarPage === totalPages - 1}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Theme Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
            <div className="flex flex-wrap gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.class}
                  onClick={() => setThemeColor(color.class)}
                  className={`w-12 h-12 rounded-xl ${color.bg} transition transform hover:scale-110 ${
                    themeColor === color.class ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Google Email (for child sign-in) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Account Email
              <span className="ml-2 text-xs text-gray-400">(for child sign-in)</span>
            </label>
            <input
              type="email"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., adrian.kids@gmail.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              When this child signs in with Google, they'll see their dashboard directly.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calculate suggested school year from DOB (HK system)
export const calculateSchoolYear = (dob: string): string => {
  if (!dob) return '';
  
  const birthDate = new Date(dob);
  const now = new Date();
  
  // HK school year starts in September
  // If birthday is before September, they're older for their grade
  const birthMonth = birthDate.getMonth();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const age = currentMonth >= 8 // September (0-indexed)
    ? currentYear - birthDate.getFullYear()
    : currentYear - birthDate.getFullYear() - 1;
  
  // Year 1 starts around age 5
  const schoolYear = age - 4;
  
  if (schoolYear >= 1 && schoolYear <= 12) {
    return `Year ${schoolYear}`;
  }
  if (schoolYear < 1) {
    return 'Reception/Kindergarten';
  }
  return 'Year 12+';
};

export default EditProfile;
