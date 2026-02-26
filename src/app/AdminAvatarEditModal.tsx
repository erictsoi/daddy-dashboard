import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface AdminAvatarEditModalProps {
  currentAvatar: string;
  onSave: (avatar: string) => void;
  onClose: () => void;
}

export const AdminAvatarEditModal: React.FC<AdminAvatarEditModalProps> = ({ currentAvatar, onSave, onClose }) => {
  const [avatar, setAvatar] = useState(currentAvatar);
  const [avatarPage, setAvatarPage] = useState(0);
  const AVATARS = ['👶', '🧒', '👦', '👧', '🧑‍🦰', '👱', '🧒', '👦', '👧', '🧒', '👦', '👧', '🧑', '👨‍🦱', '👩‍🦱', '🧑‍🦳', '👨‍🦳', '👩‍🦳', '🧑‍🦲', '👨‍🦲', '👩‍🦲', '🧔', '👨', '👩', '🧑‍🚀', '👩‍🚀', '🧑‍🔬', '👩‍🔬', '🧑‍🎨', '👩‍🎨', '🧑‍🏫', '👩‍🏫', '🧑‍⚕️', '👩‍⚕️', '🧑‍🌾', '👩‍🌾', '🧑‍🍳', '👩‍🍳', '🧑‍🎤', '👩‍🎤', '🧑‍🎭', '👩‍🎭', '🧑‍🚒', '👩‍🚒', '🧑‍✈️', '👩‍✈️', '🧑‍🚀', '👩‍🚀', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🧙', '🧙‍♀️', '🧚', '🧚‍♀️', '🧛', '🧛‍♀️', '🧜', '🧜‍♀️', '🧝', '🧝‍♀️', '🧞', '🧞‍♀️', '🧟', '🧟‍♀️', '👼', '🎅', '🤶', '🦸‍♂️', '🦹‍♂️', '🧙‍♂️', '🧚‍♂️', '🧛‍♂️', '🧜‍♂️', '🧝‍♂️', '🧞‍♂️', '🧟‍♂️', '👼', '🎅', '🤶'];
  const AVATARS_PER_PAGE = 20;
  const totalPages = Math.ceil(AVATARS.length / AVATARS_PER_PAGE);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Edit Admin Avatar</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-xl justify-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-5xl">
              {avatar}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
            <div className="border border-gray-200 rounded-xl p-4">
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

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onSave(avatar)}
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
