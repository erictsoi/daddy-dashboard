import React, { useState, useRef, useEffect } from 'react';
import { ChildProfile } from '../types';
import { LogOut } from 'lucide-react';

interface ProfileSwitcherProps {
  user: any;
  data: ChildProfile[];
  adminAvatar: string;
  adminColor?: string;
  adminName?: string;
  onSignOut: () => void;
  onManageProfiles: () => void;
  onSwitchProfile: (childId: string) => void;
  onGoToLanding: () => void;
  onGoToAdmin?: () => void;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ 
  user, 
  data, 
  adminAvatar, 
  adminColor = 'blue', 
  adminName, 
  onSignOut, 
  onManageProfiles, 
  onSwitchProfile, 
  onGoToLanding, 
  onGoToAdmin 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getColorBg = (color: string, dark = false) => {
    const colors: Record<string, string> = dark ? {
      blue: '#1e40af', indigo: '#3730a3', purple: '#6b21a8', pink: '#9d174d',
      rose: '#be123c', red: '#b91c1c', orange: '#c2410c', amber: '#b45309',
      yellow: '#a16207', green: '#15803d', emerald: '#047857', teal: '#0f766e',
      cyan: '#0e7490', sky: '#0369a1', slate: '#475569'
    } : {
      blue: '#dbeafe', indigo: '#e0e7ff', purple: '#f3e8ff', pink: '#fce7f3',
      rose: '#ffe4e6', red: '#fee2e2', orange: '#ffedd5', amber: '#fef3c7',
      yellow: '#fef9c3', green: '#dcfce7', emerald: '#d1fae5', teal: '#ccfbf1',
      cyan: '#cffafe', sky: '#e0f2fe', slate: '#f1f5f9'
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition"
      >
        {user?.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: getColorBg(adminColor) }}
          >
            {adminAvatar}
          </div>
        )}
        <span className="font-medium text-gray-700 hidden sm:block">{adminName || user?.user_metadata?.full_name || user?.email}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white text-gray-800 rounded-lg shadow-2xl py-2 z-50 border border-gray-200">
          <div className="px-2 pb-2">
            {onGoToAdmin && (
              <button
                onClick={() => { onGoToAdmin(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: getColorBg(adminColor, true) }}
                >
                  {adminAvatar}
                </div>
                <div>
                  <span className="font-medium">{adminName || 'Daddy'}</span>
                  <span className="block text-xs text-gray-500">Admin</span>
                </div>
              </button>
            )}
            
            {onGoToAdmin && data.length > 0 && (
              <div className="border-t border-gray-100 my-2"></div>
            )}
            
            {data.map(child => (
              <button
                key={child.id}
                onClick={() => { onSwitchProfile(child.id); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl`} style={{ backgroundColor: child.themeColor === 'indigo' ? '#3730a3' : child.themeColor === 'rose' ? '#be123c' : '#065f46' }}>
                  {child.avatar || '👤'}
                </div>
                <span className="font-medium">{child.name || 'Student'}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          <div className="px-2">
            <button
              onClick={() => { onManageProfiles(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Manage Profiles</span>
            </button>

            <button
              onClick={() => { onSignOut(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition text-left"
            >
              <LogOut size={20} className="text-gray-400" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
