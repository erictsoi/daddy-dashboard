import React, { useState, useRef, useEffect } from 'react';
import { ViewState, ChildProfile, ScheduleBlock } from '../types';
import { migrateChildToTopicStructure } from '../src/lib/dataService';
import { fetchChildById } from '../src/lib/dataService';
import { Timeline } from '../components/Timeline';
import { ProgressBar } from '../components/ProgressBar';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Play,
    PlayCircle,
    GraduationCap,
    CheckCircle,
    Edit2,
    LogOut
} from 'lucide-react';
import { User } from 'firebase/auth';

interface ChildDashboardProps {
    childId: string;
    data: ChildProfile[];
    setData: React.Dispatch<React.SetStateAction<ChildProfile[]>>;
    childProfile: ChildProfile | null;
    setChildProfile: React.Dispatch<React.SetStateAction<ChildProfile | null>>;
    allChildren: { id: string, name: string, avatar: string, themeColor: string }[];
    user: User | null;
    signOut: () => void;
    view: ViewState;
    setView: (view: ViewState) => void;
    parentUid: string;
    adminName: string;
    adminAvatar: string;
    adminColor: string;
    isDayActive: boolean;
    setIsDayActive: (active: boolean) => void;
    schedule: ScheduleBlock[];
    generateSchedule: (hours: number) => void;
}

export const ChildDashboard = ({
    childId,
    data,
    setData,
    childProfile,
    setChildProfile,
    allChildren,
    user,
    signOut,
    view,
    setView,
    parentUid,
    adminName,
    adminAvatar,
    adminColor,
    isDayActive,
    setIsDayActive,
    schedule,
    generateSchedule
}: ChildDashboardProps) => {
    const navigate = useNavigate();
    let child = data.find(c => c.id === childId);

    // Fallback to childProfile if needed, with migration
    if (!child && childProfile?.id === childId) {
        child = migrateChildToTopicStructure(childProfile);
    }

    if (!child) return null;

    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className={`bg-${child.themeColor}-600 text-white pb-24 pt-8 px-6`}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">{child.name}'s Space</h1>
                            <p className="text-white/80">Ready to learn today?</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate('/')} className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition">Landing</button>
                            <button onClick={() => navigate('/returning')} className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition">Return</button>
                            <button onClick={() => navigate('/dashboard')} className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition">Admin</button>
                            <button onClick={() => navigate('/child/sophia')} className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition">Sophia</button>
                            <button onClick={() => navigate('/child/adrian')} className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition">Adrian</button>
                            <button onClick={() => navigate('/curriculum')} className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition">Curriculum</button>
                            <button onClick={() => navigate('/manage')} className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition">Manage</button>
                            </div>
                            <div className="relative ml-2" ref={profileDropdownRef}>
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="text-4xl hover:scale-110 transition cursor-pointer"
                            >
                                {child.avatar}
                            </button>
                            {showProfileDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                                    <div className="px-3 py-2 border-b border-gray-100">
                                        <p className="font-medium text-sm text-gray-500">Switch Profile</p>
                                    </div>
                                    {user && !childProfile && (
                                        <button
                                            onClick={() => { navigate('/dashboard'); setShowProfileDropdown(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                                style={{
                                                    backgroundColor: adminColor === 'blue' ? '#1e40af' :
                                                        adminColor === 'indigo' ? '#3730a3' :
                                                            adminColor === 'purple' ? '#6b21a8' :
                                                                adminColor === 'pink' ? '#9d174d' :
                                                                    adminColor === 'rose' ? '#be123c' :
                                                                        adminColor === 'red' ? '#b91c1c' :
                                                                            adminColor === 'orange' ? '#c2410c' :
                                                                                adminColor === 'amber' ? '#b45309' :
                                                                                    adminColor === 'yellow' ? '#a16207' :
                                                                                        adminColor === 'green' ? '#15803d' :
                                                                                            adminColor === 'emerald' ? '#047857' :
                                                                                                adminColor === 'teal' ? '#0f766e' :
                                                                                                    adminColor === 'cyan' ? '#0e7490' :
                                                                                                        adminColor === 'sky' ? '#0369a1' :
                                                                                                            '#475569'
                                                }}
                                            >
                                                {adminAvatar}
                                            </div>
                                            <div>
                                                <span className="font-medium block">{adminName || user?.user_metadata?.full_name || user?.email}</span>
                                                <span className="text-xs text-gray-500">{adminName || user?.user_metadata?.full_name || user?.email || 'Daddy'} Dashboard</span>
                                            </div>
                                        </button>
                                    )}
                                    {/* Show siblings from allChildren */}
                                    {allChildren.length > 0 && allChildren.filter(c => c.id !== child?.id).map(c => (
                                        <button
                                            key={c.id}
                                            onClick={async () => {
                                                // Fetch sibling's full data if we have parent UID
                                                if (parentUid) {
                                                    const siblingData = await fetchChildById(parentUid, c.id);
                                                    if (siblingData) {
                                                        const migratedSibling = migrateChildToTopicStructure(siblingData);
                                                        setData([migratedSibling]);
                                                        setChildProfile(migratedSibling);
                                                    }
                                                }
                                                navigate(`/child/${c.id}`);
                                                setShowProfileDropdown(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-${c.themeColor}-100`}>
                                                {c.avatar}
                                            </div>
                                            <div>
                                                <span className="font-medium block">{c.name}</span>
                                                <span className="text-xs text-gray-500">Switch to</span>
                                            </div>
                                        </button>
                                    ))}
                                    {/* Show for all signed-in users */}
                                    {user && (
                                        <>
                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                {!childProfile && (
                                                    <button
                                                        onClick={() => { navigate('/manage'); setShowProfileDropdown(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition text-left text-sm"
                                                    >
                                                        <Edit2 size={16} />
                                                        Manage Profiles
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { signOut?.(); setShowProfileDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition text-left text-sm"
                                                >
                                                    <LogOut size={16} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-16 space-y-12 pb-20">

                {/* Timeline on Child Dashboard - Show dual schedule for all kids */}
                {isDayActive ? (
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Calendar size={24} className="text-gray-500" /> Today's Timetable
                            </h2>
                            <button
                                onClick={() => setIsDayActive(false)}
                                className="text-sm text-red-500 hover:text-red-700"
                            >
                                Reset Day
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            <Timeline
                                schedule={schedule}
                                childProfiles={data}
                                focusedChildId={undefined}
                                onBlockClick={(cId, sId, tId, lId) => {
                                    navigate(`/child/${cId}/subject/${sId}/topic/${tId}/lesson/${lId}`);
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col items-center justify-center text-center gap-6 mb-8">
                        <div className={`p-6 rounded-full bg-${child.themeColor}-50 text-${child.themeColor}-500 mb-2`}>
                            <PlayCircle size={48} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Start School Day</h3>
                            <p className="text-gray-500">Ready to begin your learning adventure?</p>
                        </div>
                        <button
                            onClick={() => generateSchedule(5)}
                            className={`bg-${child.themeColor}-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-${child.themeColor}-700 hover:scale-105 transition-all flex items-center gap-3`}
                        >
                            <Play size={24} fill="currentColor" /> Let's Go!
                        </button>
                    </div>
                )}

                {child.yearGroups.map((yg) => (
                    <div key={yg.id}>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <GraduationCap className={`text-${child.themeColor}-600`} /> {yg.name} Curriculum
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {yg.subjects.map(subject => {
                                const allLessons = subject.topics.flatMap(t => t.lessons);
                                const completedCount = allLessons.filter(l => l.completed && !l.deleted).length;
                                const totalCount = allLessons.filter(l => !l.deleted).length;

                                return (
                                    <div
                                        key={subject.id}
                                        className="p-3 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-300 transition cursor-pointer group flex flex-col justify-between"
                                        onClick={() => navigate(`/child/${child!.id}/subject/${subject.id}`)}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 rounded-full ${subject.color.includes('blue') ? 'bg-blue-500' :
                                                        subject.color.includes('green') ? 'bg-green-500' :
                                                            subject.color.includes('amber') ? 'bg-amber-500' :
                                                                subject.color.includes('rose') ? 'bg-rose-500' :
                                                                    subject.color.includes('indigo') ? 'bg-indigo-500' :
                                                                        'bg-gray-400'
                                                    }`}></div>
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1 truncate">{subject.category}</div>
                                                {completedCount === totalCount && totalCount > 0 && <CheckCircle size={14} className="text-green-500" />}
                                            </div>

                                            <div className="font-bold text-gray-800 text-xs mb-3 truncate group-hover:text-blue-600 transition-colors">
                                                {subject.topics[0]?.name || subject.name}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                                <span>{completedCount}/{totalCount} completed</span>
                                            </div>
                                            <ProgressBar
                                                current={completedCount}
                                                total={totalCount}
                                                colorClass={`bg-${child!.themeColor}-500`}
                                                heightClass="h-1.5"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
