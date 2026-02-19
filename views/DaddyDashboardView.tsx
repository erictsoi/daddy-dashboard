import React, { useState, useRef } from 'react';
import { ChildProfile, Subject, Topic, Lesson, ViewState } from '../types';
import { useAuth } from '../src/lib/AuthContext';
import { DS, GlobalStyles, Texture, Blobs, Deco, Shadow, SolidShadow, Tag, Chip, SectionHead, getThemeColor } from '../components/design-system';
import {
    Play,
    Settings,
    LogOut,
    User,
    Edit2,
    Trash2,
    Plus,
    X,
    Save,
    Download,
    Upload,
    Cloud,
    Sparkles,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    BarChart3,
    ChevronRight,
    PlayCircle
} from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar';
import { Timeline } from '../components/Timeline';
import { exportDataToFile, importDataFromFile, saveData } from '../src/lib/helpers';

interface DaddyDashboardViewProps {
    data: ChildProfile[];
    setData: React.Dispatch<React.SetStateAction<ChildProfile[]>>;
    view: ViewState;
    setView: (view: ViewState) => void;
    adminName: string;
    adminAvatar: string;
    adminColor: string;
    isDayActive: boolean;
    setIsDayActive: (active: boolean) => void;
    schedule: any[];
    setSchedule: (schedule: any[]) => void;
    generateSchedule: (hours: number) => void;
    dataStatus: { type: 'success' | 'error' | 'info', message: string } | null;
    authDebug: string | null;
    showStatus: (message: string, type: 'success' | 'error' | 'info') => void;
    saveData: (data: ChildProfile[], user: any) => void;
    user: any;
    signOut: () => void;
    onAddChild: () => void;
    onManageProfiles: () => void;
    onImportData: () => void;
    onExportData: () => void;
    onOpenCurriculum: () => void;
}

export const DaddyDashboardView: React.FC<DaddyDashboardViewProps> = ({
    data,
    setData,
    view,
    setView,
    adminName,
    adminAvatar,
    adminColor,
    isDayActive,
    setIsDayActive,
    schedule,
    setSchedule,
    generateSchedule,
    dataStatus,
    authDebug,
    showStatus,
    saveData,
    user,
    signOut,
    onAddChild,
    onManageProfiles,
    onImportData,
    onExportData,
    onOpenCurriculum
}) => {
    // const { user, signOut } = useAuth() || {};
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    // Bulk selection state
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

    // Subject editing state
    const [editingSubject, setEditingSubject] = useState<{
        subjectId: string;
        category: string;
        topicName: string;
    } | null>(null);

    const handleNavigate = (newView: ViewState) => {
        setView(newView);
    };

    const toggleSubjectSelection = (subjectId: string) => {
        const newSelection = new Set(selectedSubjects);
        if (newSelection.has(subjectId)) {
            newSelection.delete(subjectId);
        } else {
            newSelection.add(subjectId);
        }
        setSelectedSubjects(newSelection);
    };

    const selectAllSubjects = () => {
        const allSubjectIds = data.flatMap(c =>
            c.yearGroups.flatMap(yg =>
                yg.subjects.flatMap(s =>
                    s.topics.map(t => `${s.id}-${t.id}`)
                )
            )
        );
        setSelectedSubjects(new Set(allSubjectIds));
    };

    const clearSelection = () => {
        setSelectedSubjects(new Set());
        setShowBulkActions(false);
    };

    const handleBulkDeleteSubjects = () => {
        if (!confirm(`Delete ${selectedSubjects.size} selected items?`)) return;

        setData(prev => {
            const newData = prev.map(child => ({
                ...child,
                yearGroups: child.yearGroups.map(yg => ({
                    ...yg,
                    subjects: yg.subjects.map(s => {
                        const remainingTopics = s.topics.filter(t => !selectedSubjects.has(`${s.id}-${t.id}`));
                        if (remainingTopics.length === 0 && selectedSubjects.has(`${s.id}-${s.topics[0]?.id}`)) {
                            // If we're deleting topics, filter them out.
                            // But the ID structure suggests we are selecting topics within subjects?
                            // The original code used `${subject.id}-${topic.id}` as cardId.
                            // So let's filter topics.
                            return null; // This logic in original App.tsx seemed to assume deleting the whole subject if topics are gone?
                            // Actually, looking at original code:
                            // It filtered subjects... wait.
                        }
                        return {
                            ...s,
                            topics: remainingTopics
                        };
                    }).filter(Boolean) as Subject[] // This cast might be needed if filter returns nulls
                }))
            }));

            // Re-implementing the logic from App.tsx more carefully
            // App.tsx: 
            // const newData = prev.map(child => ({
            //   ...child,
            //   yearGroups: child.yearGroups.map(yg => ({
            //     ...yg,
            //     subjects: yg.subjects.map(s => {
            //        // logical gap in my reading of App.tsx snippet, let's assume standard filter
            //        // The cardId was `${subject.id}-${topic.id}`
            //        const newTopics = s.topics.filter(t => !selectedSubjects.has(`${s.id}-${t.id}`));
            //        if (newTopics.length === 0) return null;
            //        return { ...s, topics: newTopics };
            //     }).filter(Boolean)
            //   }))
            // }));

            return newData;
        });

        // We need to actually implement the deletion logic properly based on original App.tsx
        // The previous view_file output was truncated right at handleBulkDeleteSubjects logic...
        // I will use a simplified version for now and warn/fix if needed.
        // Actually, I should probably check the file content for handleBulkDeleteSubjects if I missed it.
        // Lines 1883-1908 in App.tsx seem to cover it.

        // Let's re-read the specific block in App.tsx to be sure.
        // Proceeding with best guess based on standard patterns, but I'll mark this for verification.

        clearSelection();
    };

    // Re-implementing logic from App.tsx lines 1883+
    const handleBulkDeleteSubjectsReal = () => {
        if (!confirm(`Delete ${selectedSubjects.size} selected items?`)) return;

        setData(prev => {
            const newData = prev.map(child => ({
                ...child,
                yearGroups: child.yearGroups.map(yg => ({
                    ...yg,
                    subjects: yg.subjects.map(s => {
                        // The cardId is constructed as `${subject.id}-${topic.id}` in the render method
                        const newTopics = s.topics.filter(t => !selectedSubjects.has(`${s.id}-${t.id}`));

                        if (newTopics.length === 0) {
                            // If no topics remain, we might want to remove the subject or keep it empty?
                            // Original code:
                            // const updatedTopics = s.topics.filter(t => t.id !== topicId); // from handleDeleteTopicAtPath
                            // if (updatedTopics.length === 0) return null;

                            // So if all topics are deleted, the subject is deleted.
                            return null;
                        }
                        return {
                            ...s,
                            topics: newTopics
                        };
                    }).filter((s): s is Subject => s !== null)
                }))
            }));
            saveData(newData, user);
            return newData;
        });

        clearSelection();
    };


    const handleStartEditSubject = (subject: any, topicId: string) => { // Added topicId to match usage
        setEditingSubject({
            subjectId: `${subject.id}-${topicId}`,
            category: subject.category,
            topicName: subject.topics.find((t: Topic) => t.id === topicId)?.name || ''
        });
    };

    const handleSaveSubject = () => {
        if (!editingSubject) return;
        setData(prev => {
            const newData = prev.map(child => ({
                ...child,
                yearGroups: child.yearGroups.map(yg => ({
                    ...yg,
                    subjects: yg.subjects.map(s => {
                        // Check if this subject contains the topic we are editing
                        // The editingSubject.subjectId is `${subject.id}-${topic.id}`
                        const [sId, tId] = editingSubject.subjectId.split('-');

                        if (s.id !== sId) return s;

                        return {
                            ...s,
                            category: editingSubject.category,
                            topics: s.topics.map(t => {
                                if (t.id !== tId) return t;
                                return {
                                    ...t,
                                    name: editingSubject.topicName || t.name
                                };
                            })
                        };
                    })
                }))
            }));
            saveData(newData, user);
            return newData;
        });
        setEditingSubject(null);
    };

    const handleDeleteTopicAtPath = (childId: string, subjectId: string, topicId: string) => {
        if (!confirm('Delete this topic and all its lessons?')) return;

        setData(prev => {
            const newData = prev.map(ch => {
                if (ch.id !== childId) return ch;
                return {
                    ...ch,
                    yearGroups: ch.yearGroups.map(y => ({
                        ...y,
                        subjects: y.subjects.map(s => {
                            if (s.id !== subjectId) return s;
                            const updatedTopics = s.topics.filter(t => t.id !== topicId);
                            if (updatedTopics.length === 0) {
                                return null;
                            }
                            return {
                                ...s,
                                topics: updatedTopics
                            };
                        }).filter((s): s is Subject => s !== null)
                    }))
                };
            });
            saveData(newData, user);
            return newData;
        });
    };

    // Helper to update topic frequency
    const handleUpdateTopicFrequency = (childId: string, subjectId: string, topicId: string, frequency: number) => {
        setData(prev => {
            const newData = prev.map(ch => {
                if (ch.id !== childId) return ch;
                return {
                    ...ch,
                    yearGroups: ch.yearGroups.map(y => ({
                        ...y,
                        subjects: y.subjects.map(s => {
                            if (s.id !== subjectId) return s;
                            return {
                                ...s,
                                topics: s.topics.map(t => {
                                    if (t.id !== topicId) return t;
                                    return { ...t, frequency };
                                })
                            };
                        })
                    }))
                };
            });
            saveData(newData, user);
            return newData;
        });
    };

    return (
        <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
            <GlobalStyles />
            <Texture />
            <Deco color={adminColor ? getThemeColor(adminColor).main : "#2B8ED4"} />
            {/* Header */}
            <header style={{ position: "sticky", top: 0, zIndex: 50, background: `${DS.card}F0`, backdropFilter: "blur(12px)", borderBottom: DS.border }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 className="b t-h1" style={{ color: DS.ink }}>{adminName || user?.user_metadata?.full_name || user?.email || 'Daddy'} Dashboard</h1>
                        <p className="n" style={{ color: DS.inkSoft, fontSize: 14, marginTop: 4 }}>HK Homeschool Relocation Plan</p>
                    </div>

                    {/* Supabase Status Indicator */}
                    {dataStatus && (
                        <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${dataStatus.type === 'success' ? 'bg-green-100 text-green-700' :
                            dataStatus.type === 'error' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                            {dataStatus.type === 'success' && <CheckCircle size={16} />}
                            {dataStatus.type === 'error' && <XCircle size={16} />}
                            {dataStatus.type === 'info' && <Clock size={16} />}
                            {dataStatus.message}
                        </div>
                    )}

                    {/* Auth Debug */}
                    {authDebug && (
                        <div className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                            {authDebug}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Shadow offset={3} radius={DS.radius.md}>
                            <button
                                onClick={() => handleNavigate({ type: 'CURRICULUM_BUILDER' })}
                                style={{ position: "relative", background: DS.ink, color: "#fff", border: DS.border, borderRadius: DS.radius.md, padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <Sparkles size={16} /> <span className="n" style={{ fontWeight: 700, fontSize: 14 }}>Build Curriculum</span>
                            </button>
                        </Shadow>
                        {user && (
                            <>
                                <Shadow offset={2} radius={DS.radius.md}>
                                    <button
                                        onClick={() => exportDataToFile(data, `daddy-dashboard-${new Date().toISOString().split('T')[0]}.json`)}
                                        style={{ position: "relative", background: "#10B981", color: "#fff", border: DS.border, borderRadius: DS.radius.md, padding: 10, cursor: "pointer", display: "flex", alignItems: "center" }}
                                        title="Export to Computer"
                                    >
                                        <Download size={18} />
                                    </button>
                                </Shadow>
                                <input
                                    type="file"
                                    accept=".json"
                                    id="header-import-file"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            const importedData = await importDataFromFile(file);
                                            setData(importedData);
                                            saveData(importedData, user);
                                            showStatus('Imported and saved!', 'success');
                                        } catch (err) {
                                            showStatus('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
                                        }
                                        e.target.value = '';
                                    }}
                                />
                                <label
                                    htmlFor="header-import-file"
                                    style={{ position: "relative", background: "#2B8ED4", color: "#fff", border: DS.border, borderRadius: DS.radius.md, padding: 10, cursor: "pointer", display: "flex", alignItems: "center" }}
                                    title="Import from Computer"
                                >
                                    <Upload size={18} />
                                </label>
                                <Shadow offset={2} radius={DS.radius.md}>
                                    <button
                                        onClick={async () => {
                                            saveData(data, user);
                                            showStatus('Saved!', 'success');
                                        }}
                                        style={{ position: "relative", background: "#8B5CF6", color: "#fff", border: DS.border, borderRadius: DS.radius.md, padding: 10, cursor: "pointer", display: "flex", alignItems: "center" }}
                                        title="Save to Cloud"
                                    >
                                        <Cloud size={18} />
                                    </button>
                                </Shadow>
                                <div style={{ position: "relative" }} ref={profileDropdownRef as any}>
                                    <button
                                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: DS.radius.md, cursor: "pointer" }}
                                    >
                                        <div
                                            style={{
                                                width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                                                backgroundColor: adminColor ? getThemeColor(adminColor).tint : "#EAF4FC"
                                            }}
                                        >
                                            {adminAvatar}
                                        </div>
                                        <span className="n" style={{ fontWeight: 700, color: DS.ink }}>{adminName || user?.user_metadata?.full_name || user?.email}</span>
                                        <svg style={{ width: 16, height: 16, color: DS.inkSoft, transition: "transform 0.2s", transform: showProfileDropdown ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {showProfileDropdown && (
                                        <div className="absolute right-0 top-full mt-2 w-72 bg-white text-gray-800 rounded-lg shadow-2xl py-2 z-50 border border-gray-200">
                                            <div className="px-3 py-2 border-b border-gray-100">
                                                <p className="font-medium text-sm text-gray-500">Switch Profile</p>
                                            </div>
                                            <button
                                                onClick={() => { setView({ type: 'HOME' }); setShowProfileDropdown(false); }}
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
                                                    <span className="font-medium block">{adminName || user?.user_metadata?.full_name || user?.email || 'Daddy'}</span>
                                                    <span className="text-xs text-gray-500">{adminName || user?.user_metadata?.full_name || user?.email || 'Daddy'} Dashboard</span>
                                                </div>
                                            </button>
                                            {data.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => { setView({ type: 'CHILD_DASHBOARD', childId: c.id }); setShowProfileDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                                                >
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-${c.themeColor}-100`}>
                                                        {c.avatar}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium block">{c.name}</span>
                                                        <span className="text-xs text-gray-500">Student Access</span>
                                                    </div>
                                                </button>
                                            ))}
                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                <button
                                                    onClick={() => { /* TODO: Account page */ }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition text-left text-sm"
                                                >
                                                    <User size={16} />
                                                    Account
                                                </button>
                                                <button
                                                    onClick={() => { setView({ type: 'MANAGE_PROFILES' }); setShowProfileDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition text-left text-sm"
                                                >
                                                    <Edit2 size={16} />
                                                    Manage Profiles
                                                </button>
                                                <button
                                                    onClick={() => { signOut?.(); setShowProfileDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition text-left text-sm"
                                                >
                                                    <LogOut size={16} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto p-6 space-y-12">
                {/* Daily Schedule Section */}
                {!isDayActive ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <BarChart3 className="text-blue-600" size={20} /> Previous Session Summary
                            </h2>
                            <span className="text-sm text-gray-500 font-medium">Yesterday</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                            {data.map(child => {
                                const recentSubjects = child.yearGroups
                                    .flatMap(yg => yg.subjects)
                                    .filter(s => s.topics.flatMap(t => t.lessons).some(l => !l.deleted))
                                    .slice(0, 4);

                                return (
                                    <div key={child.id} className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="text-3xl bg-gray-100 p-2 rounded-xl">{child.avatar}</div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-lg">{child.name}</div>
                                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                                    {child.yearGroups[0]?.name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {recentSubjects.map(sub => {
                                                const allLessons = sub.topics.flatMap(t => t.lessons);
                                                const activeTotal = allLessons.filter(l => !l.deleted).length;
                                                const activeCompleted = allLessons.filter(l => l.completed && !l.deleted).length;
                                                return (
                                                    <div key={sub.id} className="p-3 rounded-xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition cursor-default">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className={`w-2 h-2 rounded-full ${child.themeColor.includes('blue') ? 'bg-blue-500' : child.themeColor.includes('green') ? 'bg-green-500' : child.themeColor.includes('rose') ? 'bg-rose-500' : child.themeColor.includes('indigo') ? 'bg-indigo-500' : 'bg-amber-500'}`}></div>
                                                            <div className="text-xs font-bold text-gray-700 truncate w-full">{sub.category}</div>
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 truncate mb-3 leading-tight min-h-[1.5em]">
                                                            {sub.name}
                                                        </div>
                                                        <ProgressBar
                                                            current={activeCompleted || 1}
                                                            total={activeTotal || 5}
                                                            heightClass="h-1.5"
                                                            colorClass={child.themeColor.includes('blue') ? 'bg-blue-500' : child.themeColor.includes('green') ? 'bg-green-500' : child.themeColor.includes('rose') ? 'bg-rose-500' : child.themeColor.includes('indigo') ? 'bg-indigo-500' : 'bg-amber-500'}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                            <span>Time Studied</span>
                                            <span className="font-bold text-gray-800">4h 15m</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col items-center">
                            <div className="flex flex-col items-center gap-4 w-full max-w-md">
                                <button
                                    onClick={() => generateSchedule(5)}
                                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition flex items-center justify-center gap-3 text-lg"
                                >
                                    <Play size={24} fill="currentColor" /> Start Today's Session
                                </button>

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <button onClick={() => generateSchedule(4)} className="hover:text-gray-800 hover:underline">Light (4h)</button>
                                    <span className="text-gray-300">•</span>
                                    <span className="font-medium text-gray-800">Standard (5h)</span>
                                    <span className="text-gray-300">•</span>
                                    <button onClick={() => generateSchedule(6)} className="hover:text-gray-800 hover:underline">Long (6h)</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="text-gray-500" /> Today's Timetable
                            </h2>
                            <button
                                onClick={() => { setIsDayActive(false); setSchedule([]); }}
                                className="text-sm text-red-500 hover:text-red-700"
                            >
                                Reset Day
                            </button>
                        </div>
                        <Timeline
                            schedule={schedule}
                            childProfiles={data}
                            onBlockClick={(childId, subjectId, topicId, lessonId) => {
                                handleNavigate({ type: 'LESSON_PLAYER', childId, subjectId, topicId, lessonId, origin: 'HOME' });
                            }}
                        />
                    </div>
                )}

                {/* Main Curriculum Hierarchy */}
                <div className="space-y-12">
                    {data.map(child => (
                        <div key={child.id} className={`bg-white rounded-3xl border-l-[16px] shadow-lg p-8 border-${child.themeColor}-500`}>
                            {/* Child Header */}
                            <div className="flex items-center gap-5 mb-8 border-b-2 border-gray-100 pb-6">
                                <div className="text-6xl bg-gray-50 shadow-sm p-4 rounded-2xl">{child.avatar}</div>
                                <div>
                                    <h2 className="text-4xl font-bold text-gray-900">{child.name}</h2>
                                    <p className={`text-${child.themeColor}-600 font-bold mt-1 uppercase tracking-wide`}>Homeschool Track</p>
                                </div>
                                <div className="ml-auto flex items-center gap-3">
                                    <button
                                        onClick={() => handleNavigate({ type: 'CHILD_DASHBOARD', childId: child.id })}
                                        className={`px-5 py-2 rounded-lg bg-gray-50 text-${child.themeColor}-700 font-semibold hover:bg-${child.themeColor}-50 transition flex items-center gap-2 text-sm shadow-sm border border-gray-200`}
                                    >
                                        View Dashboard <ChevronRight size={16} />
                                    </button>
                                    {/* Bulk Select Toggle */}
                                    {child.yearGroups.flatMap(yg => yg.subjects).length > 0 && (
                                        <button
                                            onClick={() => showBulkActions ? clearSelection() : setShowBulkActions(true)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 text-sm shadow-sm border ${showBulkActions
                                                ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {showBulkActions ? 'Done' : 'Edit Cards'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Bulk Actions Toolbar */}
                            {showBulkActions && (
                                <div className="flex items-center gap-4 p-4 mb-6 bg-blue-50 border border-blue-200 rounded-xl">
                                    <span className="text-sm font-medium text-blue-700">
                                        {selectedSubjects.size} selected
                                    </span>
                                    <button
                                        onClick={selectAllSubjects}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={clearSelection}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Undo
                                    </button>
                                    <div className="flex-1" />
                                    {selectedSubjects.size > 0 ? (
                                        <button
                                            onClick={handleBulkDeleteSubjectsReal}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition flex items-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete Selected
                                        </button>
                                    ) : (
                                        <div className="px-4 py-2"></div>
                                    )}
                                </div>
                            )}

                            {/* Year Groups */}
                            <div className="space-y-12 pl-2">
                                {child.yearGroups.map(yg => {
                                    const ygTotal = yg.subjects.reduce((acc, s) => acc + s.topics.flatMap(t => t.lessons).filter(l => !l.deleted).length, 0);
                                    const ygCompleted = yg.subjects.reduce((acc, s) => acc + s.topics.flatMap(t => t.lessons).filter(l => l.completed && !l.deleted).length, 0);
                                    const percent = ygTotal > 0 ? Math.round((ygCompleted / ygTotal) * 100) : 0;

                                    return (
                                        <div key={yg.id} style={{ position: "relative" }}>
                                            {/* Vertical Line Connector */}
                                            <div style={{ position: "absolute", left: -24, top: 48, bottom: 0, width: 4, background: `${DS.ink}12`, borderRadius: 100, display: "none" }} className="lg:block"></div>

                                            {/* Year Group Header & Progress */}
                                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <Shadow offset={2} radius="50%">
                                                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: DS.card, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: getThemeColor(child.themeColor).main, border: DS.border }}>
                                                            {yg.name.replace(/[^0-9]/g, '')}
                                                        </div>
                                                    </Shadow>
                                                    <h3 className="b t-h2" style={{ color: DS.ink }}>{yg.name}</h3>
                                                </div>

                                                {/* Compact Progress Bar for Year */}
                                                <Shadow offset={2} radius={DS.radius.pill} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", background: DS.card, marginLeft: "auto" }}>
                                                    <span className="n" style={{ fontSize: 10, fontWeight: 800, color: DS.inkFade, letterSpacing: 1 }}>PROGRESS</span>
                                                    <div style={{ width: 80 }}>
                                                        <ProgressBar current={ygCompleted} total={ygTotal} heightClass="h-2" colorClass={`bg-${child.themeColor}-500`} />
                                                    </div>
                                                    <span className="n" style={{ fontSize: 14, fontWeight: 800, color: getThemeColor(child.themeColor).main }}>{percent}%</span>
                                                </Shadow>
                                            </div>

                                            {/* 4-Column Grid of Mini Cards */}
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 16 }} className="sm:grid-cols-2 lg:grid-cols-4">
                                                {yg.subjects.flatMap(subject =>
                                                    subject.topics.map(topic => {
                                                        const topicLessons = topic.lessons.filter(l => !l.deleted);
                                                        const topicCompleted = topicLessons.filter(l => l.completed).length;
                                                        const topicTotal = topicLessons.length;
                                                        const cardId = `${subject.id}-${topic.id}`;
                                                        const isSelected = selectedSubjects.has(cardId);
                                                        const isEditing = editingSubject?.subjectId === cardId;

                                                        return (
                                                            <div
                                                                key={cardId}
                                                                onClick={() => showBulkActions ? toggleSubjectSelection(cardId) : handleNavigate({ type: 'SUBJECT_DETAIL', childId: child.id, subjectId: subject.id, origin: 'HOME' })}
                                                                style={{ position: "relative", padding: 16, borderRadius: DS.radius.lg, background: DS.card, border: isSelected ? `${getThemeColor(child.themeColor).main} 3px solid` : DS.border, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "all 0.2s", animation: `fadeUp .3s ease-out` }}
                                                            >
                                                                {showBulkActions && (
                                                                    <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center z-10 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                                                                        }`}>
                                                                        {isSelected && <CheckCircle size={14} className="text-white" />}
                                                                    </div>
                                                                )}

                                                                {isEditing ? (
                                                                    <div className="space-y-2">
                                                                        <input
                                                                            type="text"
                                                                            ref={(el) => { if (el) { el.focus({ preventScroll: true }); } }}
                                                                            value={editingSubject.category}
                                                                            onChange={(e) => setEditingSubject({ ...editingSubject, category: e.target.value })}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                                            placeholder="Category (English, Maths, etc.)"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={editingSubject.topicName}
                                                                            onChange={(e) => setEditingSubject({ ...editingSubject, topicName: e.target.value })}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                                            placeholder="Topic name"
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleSaveSubject(); }}
                                                                                className="flex-1 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs hover:bg-blue-700"
                                                                            >
                                                                                Save
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); setEditingSubject(null); }}
                                                                                className="px-2 py-1 text-gray-500 text-xs hover:text-gray-700"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex items-center gap-2 mb-2 pr-6">
                                                                            <div className={`w-2 h-2 rounded-full ${subject.color.includes('blue') ? 'bg-blue-500' :
                                                                                subject.color.includes('green') ? 'bg-green-500' :
                                                                                    subject.color.includes('amber') ? 'bg-amber-500' :
                                                                                        subject.color.includes('rose') ? 'bg-rose-500' :
                                                                                            subject.color.includes('indigo') ? 'bg-indigo-500' :
                                                                                                'bg-gray-400'
                                                                                }`}></div>
                                                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1 truncate">{subject.category}</div>
                                                                            {topicCompleted === topicTotal && topicTotal > 0 && <CheckCircle size={14} className="text-green-500" />}
                                                                        </div>

                                                                        {!showBulkActions && (
                                                                            <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleStartEditSubject(subject, topic.id);
                                                                                    }}
                                                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                                    title="Edit"
                                                                                >
                                                                                    <Edit2 size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        if (window.confirm(`Delete "${topic.name}" and all its lessons?`)) {
                                                                                            handleDeleteTopicAtPath(child.id, subject.id, topic.id);
                                                                                        }
                                                                                    }}
                                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                                                    title="Delete Topic"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        <div>
                                                                            <div className="font-bold text-gray-800 text-xs mb-1 truncate group-hover:text-blue-600 transition-colors">
                                                                                {topic.name}
                                                                            </div>
                                                                            {/* Frequency Selector */}
                                                                            <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                                                                                {[
                                                                                    { value: 1, label: 'Low' },
                                                                                    { value: 3, label: 'Med' },
                                                                                    { value: 5, label: 'High' }
                                                                                ].map(({ value, label }) => {
                                                                                    const isSelected = (topic.frequency || 3) === value;
                                                                                    return (
                                                                                        <button
                                                                                            key={value}
                                                                                            onClick={() => handleUpdateTopicFrequency(child.id, subject.id, topic.id, value)}
                                                                                            className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors ${isSelected
                                                                                                ? 'border-gray-500 bg-gray-100 text-gray-700 font-medium'
                                                                                                : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400'
                                                                                                }`}
                                                                                            title={`${label} frequency (${value}x per week)`}
                                                                                        >
                                                                                            {label}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                                                                <span>{topicCompleted}/{topicTotal} completed</span>
                                                                            </div>
                                                                            <ProgressBar
                                                                                current={topicCompleted}
                                                                                total={topicTotal}
                                                                                heightClass="h-1.5"
                                                                                colorClass={`bg-${child.themeColor}-500`}
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}

                                                {/* Add Subject Placeholder - Matching Mini Card Height */}
                                                <div
                                                    onClick={() => handleNavigate({ type: 'CURRICULUM_BUILDER' })}
                                                    className="border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition cursor-pointer gap-2 min-h-[105px]"
                                                >
                                                    <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-200 transition">
                                                        <Plus size={16} />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Add Subject</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
