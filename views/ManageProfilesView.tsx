import React, { useState } from 'react';
import { ViewState, ChildProfile, YearGroup } from '../types';
import { User } from 'firebase/auth';
import { DS, Shadow, SectionHead, Texture, Deco, getThemeColor } from '../components/design-system';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UserPlus,
    Edit2,
    X,
} from 'lucide-react';

interface ManageProfilesViewProps {
    data: ChildProfile[];
    setData: React.Dispatch<React.SetStateAction<ChildProfile[]>>;
    user: User | null;
    signOut: () => void;
    view: ViewState;
    setView: (view: ViewState) => void;
    saveData: (data: ChildProfile[], user: any) => Promise<string>;
    adminName: string;
    setAdminName: (name: string) => void;
    adminAvatar: string;
    setAdminAvatar: (avatar: string) => void;
    adminColor: string;
    setAdminColor: (color: string) => void;
    adminDob: string;
    setAdminDob: (dob: string) => void;
    onDeleteChild: (id: string) => void;
    onAddYearGroup: (childId: string, name: string) => void;
    onRemoveYearGroup: (childId: string, ygId: string) => void;
}

export const ManageProfilesView = ({
    data,
    setData,
    user,
    signOut,
    view,
    setView,
    saveData,
    adminName,
    setAdminName,
    adminAvatar,
    setAdminAvatar,
    adminColor,
    setAdminColor,
    adminDob,
    setAdminDob,
    onDeleteChild,
    onAddYearGroup,
    onRemoveYearGroup
}: ManageProfilesViewProps) => {

    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [editingChildId, setEditingChildId] = useState<string | null>(null);
    const [editingYearGroups, setEditingYearGroups] = useState<string | null>(null);
    const [editingAdmin, setEditingAdmin] = useState(false);

    // Admin edit states - use props as initial values
    const [editAdminDob, setEditAdminDob] = useState(adminDob);
    const [editAdminName, setEditAdminName] = useState(adminName);
    const [editAdminAvatar, setEditAdminAvatar] = useState(adminAvatar);
    const [editAdminColor, setEditAdminColor] = useState(adminColor);
    const [adminAvatarPage, setAdminAvatarPage] = useState(0);

    // Kid edit states
    const [editName, setEditName] = useState('');
    const [editDob, setEditDob] = useState('');
    const [editGoogleEmail, setEditGoogleEmail] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editColor, setEditColor] = useState('');
    const [avatarPage, setAvatarPage] = useState(0);
    const [newYearGroup, setNewYearGroup] = useState('');

    const AVATARS = ['👶', '🧒', '👦', '👧', '🧑‍🦰', '👱', '🧑', '👨‍🦱', '👩‍🦱', '🧑‍🦳', '👨‍🦳', '👩‍🦳', '🧑‍🦲', '👨‍🦲', '👩‍🦲', '🧔', '👨', '👩', '🧑‍🚀', '👩‍🚀', '🧑‍🔬', '👩‍🔬', '🧑‍🎨', '👩‍🎨', '🧑‍🏫', '👩‍🏫', '🧑‍⚕️', '👩‍⚕️', '🧑‍🌾', '👩‍🌾', '🧑‍🍳', '👩‍🍳', '🧑‍🎤', '👩‍🎤', '🧑‍🎭', '👩‍🎭', '🧑‍🚒', '👩‍🚒', '🧑‍✈️', '👩‍✈️', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🧙', '🧙‍♀️', '🧚', '🧚‍♀️', '🧛', '🧛‍♀️', '🧜', '🧜‍♀️', '🧝', '🧝‍♀️', '🧞', '🧞‍♀️', '🧟', '🧟‍♀️', '👼', '🎅', '🤶', '🦸‍♂️', '🦹‍♂️', '🧙‍♂️', '🧚‍♂️', '🧛‍♂️', '🧜‍♂️', '🧝‍♂️', '🧞‍♂️', '🧟‍♂️'];
    const AVATARS_PER_PAGE = 20;
    const THEME_COLORS = [
        { name: 'Blue', class: 'blue', bg: '#dbeafe', text: '#1e40af' },
        { name: 'Indigo', class: 'indigo', bg: '#e0e7ff', text: '#3730a3' },
        { name: 'Purple', class: 'purple', bg: '#f3e8ff', text: '#6b21a8' },
        { name: 'Pink', class: 'pink', bg: '#fce7f3', text: '#9d174d' },
        { name: 'Rose', class: 'rose', bg: '#ffe4e6', text: '#be123c' },
        { name: 'Red', class: 'red', bg: '#fee2e2', text: '#b91c1c' },
        { name: 'Orange', class: 'orange', bg: '#ffedd5', text: '#c2410c' },
        { name: 'Amber', class: 'amber', bg: '#fef3c7', text: '#b45309' },
        { name: 'Yellow', class: 'yellow', bg: '#fef9c3', text: '#a16207' },
        { name: 'Green', class: 'green', bg: '#dcfce7', text: '#15803d' },
        { name: 'Emerald', class: 'emerald', bg: '#d1fae5', text: '#047857' },
        { name: 'Teal', class: 'teal', bg: '#ccfbf1', text: '#0f766e' },
        { name: 'Cyan', class: 'cyan', bg: '#cffafe', text: '#0e7490' },
        { name: 'Sky', class: 'sky', bg: '#e0f2fe', text: '#0369a1' },
        { name: 'Slate', class: 'slate', bg: '#f1f5f9', text: '#475569' },
    ];

    const handleSaveAdmin = () => {
        setAdminAvatar(editAdminAvatar);
        setAdminColor(editAdminColor);
        setAdminName(editAdminName);
        setAdminDob(editAdminDob);
        setEditingAdmin(false);
    };

    const handleSaveKid = () => {
        if (!editingChildId || !editName.trim()) return;

        setData(prev => {
            const newData = prev.map(child => {
                if (child.id !== editingChildId) return child;
                return {
                    ...child,
                    name: editName.trim(),
                    dob: editDob,
                    avatar: editAvatar,
                    themeColor: editColor,
                    googleEmail: editGoogleEmail.trim() || undefined,
                };
            });
            saveData(newData, user);
            return newData;
        });

        setEditingChildId(null);
    };

    const startEditingChild = (child: ChildProfile) => {
        setEditingChildId(child.id);
        setEditName(child.name);
        setEditDob(child.dob);
        setEditAvatar(child.avatar);
        setEditColor(child.themeColor);
        setEditGoogleEmail(child.googleEmail || '');
        setAvatarPage(0);
        setIsAdding(false);
    };

    const startAddingChild = () => {
        setIsAdding(true);
        setEditingChildId(null);
        setEditName('');
        setEditDob('');
        setEditGoogleEmail('');
        setEditAvatar('👶');
        setEditColor('blue');
        setAvatarPage(0);
    };

    const handleAddChildLocal = () => {
        if (!editName.trim()) return;

        const newChild: ChildProfile = {
            id: crypto.randomUUID(),
            name: editName.trim(),
            dob: editDob,
            avatar: editAvatar,
            themeColor: editColor,
            googleEmail: editGoogleEmail.trim() || undefined,
            yearGroups: [],
        };

        setData(prev => {
            const newData = [...prev, newChild];
            saveData(newData, user);
            return newData;
        });

        setIsAdding(false);
        setEditName('');
        setEditDob('');
        setEditGoogleEmail('');
    };

    const cancelEdit = () => {
        setIsAdding(false);
        setEditingChildId(null);
    };

    const handleAddYearGroupFromView = (childId: string) => {
        if (newYearGroup.trim()) {
            onAddYearGroup(childId, newYearGroup.trim());
            setNewYearGroup('');
        }
    };

    const totalPages = Math.ceil(AVATARS.length / AVATARS_PER_PAGE);

    return (
        <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
            <Texture />
            <Deco color={DS.ink} />
            {/* Header */}
            <header style={{ background: `${DS.card}F0`, backdropFilter: "blur(12px)", borderBottom: DS.border, padding: "16px 24px", position: "relative", zIndex: 10 }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{ padding: "6px 10px", background: DS.cream, border: DS.border, borderRadius: DS.radius.sm, cursor: "pointer", color: DS.inkSoft, fontWeight: 700, fontSize: 11 }}
                        >
                            Landing
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{ display: "flex", alignItems: "center", gap: 8, color: DS.inkSoft, cursor: "pointer", fontWeight: 600, background: "none", border: "none" }}
                        >
                            <ArrowLeft size={20} />
                            Back
                        </button>
                        <button
                            onClick={() => navigate('/child/sophia/subject/demo/topic/demo/lesson/demo')}
                            style={{ padding: "6px 10px", background: DS.cream, border: DS.border, borderRadius: DS.radius.sm, cursor: "pointer", color: DS.inkSoft, fontWeight: 700, fontSize: 11 }}
                        >
                            Lesson
                        </button>
                    </div>
                    <h1 className="b" style={{ fontSize: 22, fontWeight: 800, color: DS.ink }}>Manage Profiles</h1>
                    <div style={{ width: 100 }}></div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Admin Profile Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Account Owner</h2>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                    style={{
                                        backgroundColor: THEME_COLORS.find(c => c.class === editAdminColor)?.bg || '#f3f4f6'
                                    }}
                                >
                                    {adminAvatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{adminName || adminName || user?.displayName || user?.email || 'Admin'}</h3>
                                    <p className="text-sm text-gray-500">Account Administrator</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingAdmin(!editingAdmin);
                                    setEditAdminAvatar(adminAvatar);
                                    setEditAdminColor(adminColor);
                                    setEditAdminDob(adminDob);
                                    setEditAdminName(adminName);
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                            >
                                {editingAdmin ? 'Cancel' : 'Edit'}
                            </button>
                        </div>

                        {/* Admin Edit Form */}
                        {editingAdmin && (
                            <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                <div className="pt-4 space-y-4">
                                    {/* Avatar Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                                        <div className="flex flex-wrap gap-2 justify-center bg-white p-3 rounded-lg border border-gray-200">
                                            {AVATARS.slice(adminAvatarPage * AVATARS_PER_PAGE, (adminAvatarPage + 1) * AVATARS_PER_PAGE).map((a) => (
                                                <button
                                                    key={a}
                                                    onClick={() => setEditAdminAvatar(a)}
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${editAdminAvatar === a
                                                            ? 'bg-blue-100 ring-2 ring-blue-500'
                                                            : 'hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {a}
                                                </button>
                                            ))}
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="flex justify-center gap-2 mt-2">
                                                <button
                                                    onClick={() => setAdminAvatarPage(p => Math.max(0, p - 1))}
                                                    disabled={adminAvatarPage === 0}
                                                    className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                                                >
                                                    Previous
                                                </button>
                                                <span className="text-sm text-gray-600 py-1">
                                                    {adminAvatarPage + 1} / {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setAdminAvatarPage(p => Math.min(totalPages - 1, p + 1))}
                                                    disabled={adminAvatarPage === totalPages - 1}
                                                    className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Theme Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {THEME_COLORS.map((color) => (
                                                <button
                                                    key={color.class}
                                                    onClick={() => setEditAdminColor(color.class)}
                                                    className={`w-10 h-10 rounded-lg transition ${editAdminColor === color.class ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                                        }`}
                                                    style={{ backgroundColor: color.bg }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={editAdminName}
                                            onChange={(e) => setEditAdminName(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    {/* Email (read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sign-in Email</label>
                                        <input
                                            type="text"
                                            value={user?.email || ''}
                                            readOnly
                                            className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                                        />
                                    </div>

                                    {/* DOB */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (optional)</label>
                                        <input
                                            type="date"
                                            value={editAdminDob}
                                            onChange={(e) => setEditAdminDob(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveAdmin}
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profiles Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Student Profiles</h2>
                        <button
                            onClick={startAddingChild}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2"
                        >
                            <UserPlus size={18} />
                            Add Student
                        </button>
                    </div>

                    {/* Add New Student Form */}
                    {isAdding && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Student</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Enter student name"
                                    />
                                </div>

                                {/* Avatar Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                                    <div className="flex flex-wrap gap-2 justify-center bg-gray-50 p-3 rounded-lg">
                                        {AVATARS.slice(avatarPage * AVATARS_PER_PAGE, (avatarPage + 1) * AVATARS_PER_PAGE).map((a) => (
                                            <button
                                                key={a}
                                                onClick={() => setEditAvatar(a)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${editAvatar === a
                                                        ? 'bg-blue-100 ring-2 ring-blue-500'
                                                        : 'hover:bg-white'
                                                    }`}
                                            >
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="flex justify-center gap-2 mt-2">
                                            <button
                                                onClick={() => setAvatarPage(p => Math.max(0, p - 1))}
                                                disabled={avatarPage === 0}
                                                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-600 py-1">
                                                {avatarPage + 1} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setAvatarPage(p => Math.min(totalPages - 1, p + 1))}
                                                disabled={avatarPage === totalPages - 1}
                                                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Theme Color */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                                    <div className="flex flex-wrap gap-2">
                                        {THEME_COLORS.map((color) => (
                                            <button
                                                key={color.class}
                                                onClick={() => setEditColor(color.class)}
                                                className={`w-10 h-10 rounded-lg transition ${editColor === color.class ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                                    }`}
                                                style={{ backgroundColor: color.bg }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (optional)</label>
                                    <input
                                        type="date"
                                        value={editDob}
                                        onChange={(e) => setEditDob(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Email (optional - for student login)</label>
                                    <input
                                        type="email"
                                        value={editGoogleEmail}
                                        onChange={(e) => setEditGoogleEmail(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="student@gmail.com"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddChildLocal}
                                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                                    >
                                        Add Student
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {data.map((child, index) => (
                            <div
                                key={child.id}
                                className={`${index !== data.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                            style={{
                                                backgroundColor: THEME_COLORS.find(c => c.class === child.themeColor)?.bg || '#f3f4f6'
                                            }}
                                        >
                                            {child.avatar || '👤'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{child.name || 'Student'}</h3>
                                            <p className="text-sm text-gray-500">{child.yearGroups.map(yg => yg.name).join(', ') || 'No year groups'}</p>
                                            {child.googleEmail && <p className="text-xs text-blue-600 mt-1">🔗 {child.googleEmail}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingYearGroups(editingYearGroups === child.id ? null : child.id)}
                                            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            {editingYearGroups === child.id ? 'Hide Year Groups' : 'Manage Year Groups'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (editingChildId === child.id) {
                                                    setEditingChildId(null);
                                                } else {
                                                    startEditingChild(child);
                                                }
                                            }}
                                            className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            {editingChildId === child.id ? 'Cancel' : 'Edit'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${child.name || 'this student'}?`)) {
                                                    onDeleteChild(child.id);
                                                }
                                            }}
                                            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Kid Edit Form - Expand Below */}
                                {editingChildId === child.id && (
                                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                        <div className="pt-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>

                                            {/* Avatar Selection */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                                                <div className="flex flex-wrap gap-2 justify-center bg-white p-3 rounded-lg border border-gray-200">
                                                    {AVATARS.slice(avatarPage * AVATARS_PER_PAGE, (avatarPage + 1) * AVATARS_PER_PAGE).map((a) => (
                                                        <button
                                                            key={a}
                                                            onClick={() => setEditAvatar(a)}
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${editAvatar === a
                                                                    ? 'bg-blue-100 ring-2 ring-blue-500'
                                                                    : 'hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {a}
                                                        </button>
                                                    ))}
                                                </div>
                                                {totalPages > 1 && (
                                                    <div className="flex justify-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => setAvatarPage(p => Math.max(0, p - 1))}
                                                            disabled={avatarPage === 0}
                                                            className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                                                        >
                                                            Previous
                                                        </button>
                                                        <span className="text-sm text-gray-600 py-1">
                                                            {avatarPage + 1} / {totalPages}
                                                        </span>
                                                        <button
                                                            onClick={() => setAvatarPage(p => Math.min(totalPages - 1, p + 1))}
                                                            disabled={avatarPage === totalPages - 1}
                                                            className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Theme Color */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {THEME_COLORS.map((color) => (
                                                        <button
                                                            key={color.class}
                                                            onClick={() => setEditColor(color.class)}
                                                            className={`w-10 h-10 rounded-lg transition ${editColor === color.class ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                                                }`}
                                                            style={{ backgroundColor: color.bg }}
                                                            title={color.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (optional)</label>
                                                <input
                                                    type="date"
                                                    value={editDob}
                                                    onChange={(e) => setEditDob(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Google Email (optional - for student login)</label>
                                                <input
                                                    type="email"
                                                    value={editGoogleEmail}
                                                    onChange={(e) => setEditGoogleEmail(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="student@gmail.com"
                                                />
                                            </div>

                                            <button
                                                onClick={handleSaveKid}
                                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Year Groups Management */}
                                {editingYearGroups === child.id && (
                                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                        <div className="pt-2 space-y-2">
                                            {child.yearGroups.map((yg) => (
                                                <div key={yg.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200">
                                                    <span className="font-medium text-gray-700">{yg.name}</span>
                                                    <button
                                                        onClick={() => onRemoveYearGroup(child.id, yg.id)}
                                                        className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="flex gap-2 mt-3">
                                                <input
                                                    type="text"
                                                    value={newYearGroup}
                                                    onChange={(e) => setNewYearGroup(e.target.value)}
                                                    placeholder="Add year group (e.g., Year 5)"
                                                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                                <button
                                                    onClick={() => handleAddYearGroupFromView(child.id)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => signOut?.()}
                        className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};
