import React from 'react';
import { getDummyChild } from '../src/data/dummyData';

interface KidDashProps {
    childId: string;
}

export const KidDash: React.FC<KidDashProps> = ({ childId }) => {
    const child = getDummyChild(childId);
    
    if (!child) {
        return (
            <div style={{ 
                minHeight: "100vh", 
                background: "#FAF6F0", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontFamily: "'Nunito Sans', sans-serif",
                color: "#1A1A2E"
            }}>
                <div style={{ textAlign: "center" }}>
                    <h1>Kid not found: {childId}</h1>
                    <p>Available: sophia, adrian, marcus, amara, kai, rohan</p>
                </div>
            </div>
        );
    }

    const profile = {
        name: child.name,
        year: child.yearGroups?.[0]?.name || "Student",
        color: child.themeColor === 'purple' ? '#9B6DD6' : child.themeColor === 'blue' ? '#2B8ED4' : '#4CAF50',
        emoji: child.avatar
    };

    const subjects: { name: string; icon: string; progress: number; total: number; topic: string; color: string; lessonId?: string }[] = [];
    
    if (child.yearGroups) {
        for (const yg of child.yearGroups) {
            for (const sub of yg.subjects || []) {
                let lessonCount = 0;
                let completedCount = 0;
                let firstLessonId = '';
                for (const topic of sub.topics || []) {
                    for (const lesson of topic.lessons || []) {
                        lessonCount++;
                        if (lesson.completed) completedCount++;
                        if (!firstLessonId) firstLessonId = lesson.id;
                    }
                }
                const colorMap: Record<string, string> = {
                    'Maths': '#FF6B6B', 'English': '#4CAF8A', 'Science': '#2B8ED4',
                    'History': '#9B6DD6', 'Geography': '#4CAF50', 'Art': '#F5A623',
                    'PE': '#FF9800', 'Music': '#E91E63', 'Design': '#00BCD4'
                };
                const iconMap: Record<string, string> = {
                    'Maths': '📐', 'English': '📖', 'Science': '🔬',
                    'History': '📜', 'Geography': '🌍', 'Art': '🎨',
                    'PE': '⚽', 'Music': '🎵', 'Design': '✏️'
                };
                subjects.push({
                    name: sub.name,
                    icon: iconMap[sub.category || sub.name] || '📚',
                    progress: completedCount,
                    total: lessonCount || 1,
                    topic: sub.topics?.[0]?.name || sub.category || 'General',
                    color: colorMap[sub.category || sub.name] || '#9B6DD6',
                    lessonId: firstLessonId
                });
            }
        }
    }

    const schedule = [
        { subject: "Maths", topic: "Core Topics", icon: "📐", status: "done" },
        { subject: "English", topic: "Reading & Writing", icon: "📖", status: "done" },
        { subject: "LUNCH", topic: "", icon: "🍽️", status: "lunch" },
        { subject: "Science", topic: "Science Topics", icon: "🔬", status: "active" },
    ];

    return (
        <div style={{ 
            minHeight: "100vh", 
            background: "#FAF6F0",
            fontFamily: "'Nunito Sans', sans-serif",
            color: "#1A1A2E"
        }}>
            {/* Header */}
            <div style={{ 
                background: profile.color, 
                padding: "32px 24px 80px",
                borderBottom: "3px solid #1A1A2E"
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div>
                            <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Baloo 2', cursive", color: "#fff" }}>
                                {profile.name}'s Space
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>Ready to learn today?</p>
                        </div>
                        <a href="/returningview" style={{ 
                            background: "rgba(255,255,255,0.2)", 
                            color: "#fff", 
                            padding: "8px 16px", 
                            borderRadius: 8, 
                            textDecoration: "none",
                            fontWeight: 700
                        }}>
                            ← Back
                        </a>
                    </div>
                </div>
            </div>

            {/* Schedule */}
            <div style={{ maxWidth: 1200, margin: "-40px auto 24px", padding: "0 24px" }}>
                <div style={{ 
                    background: "#fff", 
                    border: "2.5px solid #1A1A2E", 
                    borderRadius: 16, 
                    padding: 20,
                    boxShadow: "8px 8px 0 #1A1A2E"
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, fontFamily: "'Baloo 2', cursive" }}>
                        Today's Schedule
                    </h2>
                    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                        {schedule.map((item, i) => (
                            <div key={i} style={{ 
                                minWidth: 140, 
                                padding: 12, 
                                borderRadius: 12, 
                                background: item.status === "done" ? "#E8F5E9" : item.status === "active" ? "#E3F2FD" : item.status === "lunch" ? "#FFF3E0" : "#FAFAFA",
                                border: "2px solid #1A1A2E",
                            }}>
                                <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
                                <div style={{ fontWeight: 800, fontSize: 14 }}>{item.subject}</div>
                                <div style={{ fontSize: 11, color: "#666" }}>{item.topic}</div>
                                {item.status === "done" && <div style={{ fontSize: 10, color: "#4CAF50", fontWeight: 800, marginTop: 4 }}>✓ DONE</div>}
                                {item.status === "active" && <div style={{ fontSize: 10, color: "#2196F3", fontWeight: 800, marginTop: 4 }}>▶ ACTIVE</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subjects */}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, fontFamily: "'Baloo 2', cursive" }}>
                    Your Subjects
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                    {subjects.map((subject, i) => (
                        <div key={i} style={{ 
                            background: "#fff", 
                            border: "2.5px solid #1A1A2E", 
                            borderRadius: 16, 
                            padding: 16,
                            cursor: "pointer",
                            transition: "transform 0.2s",
                        }}
                        onClick={() => subject.lessonId && (window.location.href = `/lessonview?child=${childId}&lesson=${subject.lessonId}`)}
                        onMouseEnter={e => (e.currentTarget.style.transform = "translate(-2px, -2px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "none")}
                        >
                            <div style={{ fontSize: 32, marginBottom: 8 }}>{subject.icon}</div>
                            <div style={{ fontWeight: 800, fontSize: 16 }}>{subject.name}</div>
                            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{subject.topic}</div>
                            <div style={{ background: "#eee", borderRadius: 4, height: 8, overflow: "hidden" }}>
                                <div style={{ 
                                    background: subject.color, 
                                    height: "100%", 
                                    width: `${(subject.progress / subject.total) * 100}%` 
                                }} />
                            </div>
                            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                                {subject.progress}/{subject.total} lessons
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
