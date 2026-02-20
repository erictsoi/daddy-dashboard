import React from 'react';
import { getDummyChild } from '../src/data/dummyData';

interface KidDashProps {
    childId: string;
}

const DS = {
    cream: "#FAF6F0",
    card: "#FFFFFF",
    ink: "#1A1A2E",
    inkSoft: "#6B6580",
    inkFade: "#B0A8C0",
    dotBrown: "#3D2B1F",
    border: "2.5px solid #1A1A2E",
    borderThick: "3px solid #1A1A2E",
    radius: { sm: 10, md: 16, lg: 22, pill: 100 },
};

const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'Nunito Sans', sans-serif; background: #FAF6F0; color: #1A1A2E; }
        .b  { font-family: 'Baloo 2', cursive; }
        .n  { font-family: 'Nunito', sans-serif; }
        .t-h2    { font-size: 22px; font-weight: 800; line-height: 1.2; }
        .t-h3    { font-size: 18px; font-weight: 800; line-height: 1.3; }
        .t-small { font-size: 12px; font-weight: 600; line-height: 1.5; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        .float { animation: float 3s ease-in-out infinite; }
    `}</style>
);

const BendayShadow = ({ offset = 3, size = 2.5 }: { offset?: number; size?: number }) => (
    <div style={{
        position: "absolute", top: offset, left: offset, right: -offset, bottom: -offset,
        zIndex: -1, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, ${DS.dotBrown} ${size}px, transparent ${size}px)`,
        backgroundSize: `${size * 2.2}px ${size * 2.2}px`,
        borderRadius: "inherit", opacity: 0.35,
    }} />
);

const Shadow: React.FC<{ children: React.ReactNode; offset?: number; size?: number; radius?: number; style?: React.CSSProperties }> = ({ children, offset = 3, size = 2.5, radius, style = {} }) => (
    <div style={{ position: "relative", borderRadius: radius, ...style }}>
        <BendayShadow offset={offset} size={size} />
        {children}
    </div>
);

export const KidDash: React.FC<KidDashProps> = ({ childId }) => {
    const child = getDummyChild(childId);
    
    if (!child) {
        return (
            <div style={{ 
                minHeight: "100vh", 
                background: DS.cream, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontFamily: "'Nunito Sans', sans-serif",
                color: DS.ink
            }}>
                <GlobalStyles />
                <div style={{ textAlign: "center" }}>
                    <h1>Kid not found: {childId}</h1>
                    <p>Available: sophia, adrian, marcus, amara, kai, rohan</p>
                </div>
            </div>
        );
    }

    const themeColor = child.themeColor === 'purple' ? '#9B6DD6' : child.themeColor === 'blue' ? '#2B8ED4' : '#4CAF50';
    
    const profile = {
        name: child.name,
        year: child.yearGroups?.[0]?.name || "Student",
        color: themeColor,
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
            background: DS.cream,
            fontFamily: "'Nunito Sans', sans-serif",
            color: DS.ink
        }}>
            <GlobalStyles />

            {/* Header */}
            <div style={{ 
                position: "relative",
                zIndex: 10, 
                background: "rgba(255, 255, 255, 0.95)", 
                backdropFilter: "blur(14px)", 
                borderBottom: DS.border,
                padding: "12px 28px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between"
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Shadow offset={2} size={2} radius={DS.radius.sm}>
                        <div style={{ 
                            position: "relative", 
                            width: 38, height: 38, 
                            background: themeColor, 
                            border: DS.border, 
                            borderRadius: DS.radius.sm, 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontSize: 18
                        }}>
                            🎓
                        </div>
                    </Shadow>
                    <span className="b t-h3" style={{ color: DS.ink }}>DADDY DASHBOARD</span>
                </div>

                {/* Right side */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Streak */}
                    <Shadow offset={2} size={1.5} radius={DS.radius.sm}>
                        <div style={{ 
                            position: "relative", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 8, 
                            background: `${themeColor}15`, 
                            border: DS.border, 
                            borderRadius: DS.radius.sm, 
                            padding: "6px 14px"
                        }}>
                            <span>🔥</span>
                            <span className="n t-small" style={{ fontWeight: 800, color: DS.ink }}>5 day streak!</span>
                        </div>
                    </Shadow>

                    {/* Profile Avatar */}
                    <div 
                        className="float"
                        onClick={() => window.location.href = '/returningview'}
                        style={{ 
                            width: 38, height: 38, 
                            background: DS.card, 
                            border: DS.border, 
                            borderRadius: DS.radius.sm, 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontSize: 20, 
                            cursor: "pointer"
                        }}
                    >
                        {profile.emoji}
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div style={{ 
                background: profile.color, 
                padding: "32px 24px 80px",
                borderBottom: DS.borderThick
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div>
                            <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Baloo 2', cursive", color: "#fff" }}>
                                {profile.name}'s Space
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>Ready to learn today?</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule */}
            <div style={{ maxWidth: 1200, margin: "-40px auto 24px", padding: "0 24px" }}>
                <Shadow offset={4} size={3} radius={DS.radius.md}>
                    <div style={{ 
                        background: DS.card, 
                        border: DS.border, 
                        borderRadius: DS.radius.md, 
                        padding: 20
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
                </Shadow>
            </div>

            {/* Subjects */}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, fontFamily: "'Baloo 2', cursive" }}>
                    Your Subjects
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                    {subjects.map((subject, i) => (
                        <div key={i} style={{ 
                            background: DS.card, 
                            border: DS.border, 
                            borderRadius: DS.radius.md, 
                            padding: 16,
                            cursor: "pointer",
                            transition: "transform 0.2s",
                        }}
                        onClick={() => subject.lessonId && (window.location.href = `/lessonview?child=${childId}&lesson=${subject.lessonId}`)}
                        onMouseEnter={e => (e.currentTarget.style.transform = "translate(-2px, -2px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "none")}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ 
                                    width: 40, height: 40, 
                                    background: `${subject.color}20`, 
                                    border: `2px solid ${subject.color}`, 
                                    borderRadius: 12, 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    fontSize: 20
                                }}>
                                    {subject.icon}
                                </div>
                                <div style={{ 
                                    position: "relative", 
                                    background: subject.color, 
                                    border: DS.border, 
                                    borderRadius: DS.radius.pill, 
                                    padding: "2px 8px"
                                }}>
                                    <span className="n t-label" style={{ color: "#fff" }}>{subject.progress}/{subject.total}</span>
                                </div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 16 }}>{subject.name}</div>
                            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{subject.topic}</div>
                            <div style={{ background: "#eee", borderRadius: 4, height: 8, overflow: "hidden" }}>
                                <div style={{ 
                                    background: subject.color, 
                                    height: "100%", 
                                    width: `${(subject.progress / subject.total) * 100}%` 
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KidDash;
