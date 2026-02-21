import React, { useState } from 'react';
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
        .t-h3    { font-size: 16px; font-weight: 800; line-height: 1.3; }
        .t-body  { font-size: 14px; font-weight: 500; line-height: 1.65; }
        .t-small { font-size: 12px; font-weight: 600; line-height: 1.5; }
        .t-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes fadeUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        .float { animation: float 3s ease-in-out infinite; }
        .card-0  { animation: fadeUp .28s .00s ease-out both; }
        .card-1  { animation: fadeUp .28s .03s ease-out both; }
        .card-2  { animation: fadeUp .28s .06s ease-out both; }
        .card-3  { animation: fadeUp .28s .09s ease-out both; }
        .card-4  { animation: fadeUp .28s .12s ease-out both; }
        .card-5  { animation: fadeUp .28s .15s ease-out both; }
        .card-6  { animation: fadeUp .28s .18s ease-out both; }
        .card-7  { animation: fadeUp .28s .21s ease-out both; }
        .card-8  { animation: fadeUp .28s .24s ease-out both; }
        .card-9  { animation: fadeUp .28s .27s ease-out both; }
        .card-10 { animation: fadeUp .28s .30s ease-out both; }
        .card-11 { animation: fadeUp .28s .33s ease-out both; }
        .subject-card { transition: transform 0.15s ease; }
        .subject-card:hover { transform: translate(-2px, -2px) !important; }
        .subject-card-inner { transition: border-color 0.15s; }
        .subject-card:hover .subject-card-inner { border-color: #1A1A2E !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #EDE8E0; }
        ::-webkit-scrollbar-thumb { background: #C4BBAF; border-radius: 3px; }
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

const Shadow: React.FC<{ children: React.ReactNode; offset?: number; size?: number; radius?: number; style?: React.CSSProperties; className?: string }> = ({ children, offset = 3, size = 2.5, radius, style = {}, className = '' }) => (
    <div className={className} style={{ position: "relative", borderRadius: radius, ...style }}>
        <BendayShadow offset={offset} size={size} />
        {children}
    </div>
);

const Texture = () => (
    <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `radial-gradient(circle, #1A1A2E08 1px, transparent 1px)`,
        backgroundSize: "20px 20px"
    }} />
);

const Blobs = ({ color }: { color: string }) => (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-12%", right: "-4%", width: 380, height: 380, borderRadius: "50%", background: color, opacity: .06, filter: "blur(64px)" }} />
        <div style={{ position: "absolute", bottom: "-5%", left: "-8%", width: 300, height: 300, borderRadius: "50%", background: color, opacity: .04, filter: "blur(52px)" }} />
    </div>
);

const Deco = ({ color }: { color: string }) => (
    <>
        <Blobs color={color} />
        {[{ t: "⭐", x: 4, y: 7, s: 26 }, { t: "✨", x: 87, y: 9, s: 20 }, { t: "🚀", x: 2, y: 48, s: 22 }, { t: "💫", x: 93, y: 72, s: 18 }, { t: "⭐", x: 47, y: 3, s: 15 }, { t: "🌈", x: 90, y: 46, s: 24 }]
            .map((d, i) => (
                <div key={i} style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, fontSize: d.s, opacity: .14, pointerEvents: "none", zIndex: 0, animation: `float ${2.6 + i * .35}s ease-in-out ${i * .18}s infinite` }}>{d.t}</div>
            ))}
    </>
);

const Chip = ({ icon, val, label, color }: { icon: string; val: string; label: string; color: string }) => (
    <Shadow offset={3} size={2.5} radius={DS.radius.md}>
        <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.md, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
            <div className="b t-h3" style={{ color }}>{val}</div>
            <div className="n t-label" style={{ color: DS.inkFade }}>{label}</div>
        </div>
    </Shadow>
);

const SectionHead = ({ label, color }: { label: string; color: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Shadow offset={2} size={2} radius={DS.radius.sm} style={{ display: "inline-block" }}>
            <div style={{ position: "relative", background: color, border: DS.border, borderRadius: DS.radius.sm, padding: "4px 16px" }}>
                <span className="b t-label" style={{ color: "#fff" }}>{label}</span>
            </div>
        </Shadow>
        <div style={{ flex: 1, height: 2, background: `${DS.ink}18`, borderRadius: 100 }} />
    </div>
);

export const KidDash: React.FC<KidDashProps> = ({ childId }) => {
    const [sel, setSel] = useState<number | null>(null);
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
    const tintColor = child.themeColor === 'purple' ? '#F3EEFF' : child.themeColor === 'blue' ? '#E3F2FD' : '#E8F5E9';
    
    const profile = {
        name: child.name,
        year: child.yearGroups?.[0]?.name || "Student",
        color: themeColor,
        tint: tintColor,
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
                    'PE': '#FF9800', 'Music': '#E91E63', 'Design': '#00BCD4',
                    'Languages': '#FF6B6B', 'PSHE': '#4CAF8A', 'Drama': '#E8507A',
                    'Technology': '#9B6DD6'
                };
                const iconMap: Record<string, string> = {
                    'Maths': '📐', 'English': '📖', 'Science': '🔬',
                    'History': '📜', 'Geography': '🌍', 'Art': '🎨',
                    'PE': '⚽', 'Music': '🎵', 'Design': '✏️',
                    'Languages': '🗣️', 'PSHE': '💛', 'Drama': '🎭',
                    'Technology': '💻'
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
        { subject: "Maths", topic: "Fractions", icon: "📐", status: "done" as const },
        { subject: "English", topic: "Creative Writing", icon: "📖", status: "done" as const },
        { subject: "LUNCH", topic: "", icon: "🍽️", status: "lunch" as const },
        { subject: "Science", topic: "Ecosystems", icon: "🔬", status: "active" as const },
        { subject: "Art", topic: "Watercolour", icon: "🎨", status: "pending" as const },
        { subject: "PE", topic: "Gymnastics", icon: "⚽", status: "stretch" as const },
    ];

    const statusCfg: Record<string, { bg: string; border: string; label: string }> = {
        done: { bg: "#E8F8F0", border: "#4CAF8A", label: "✓ Done" },
        active: { bg: profile.tint, border: profile.color, label: "● Now" },
        pending: { bg: DS.card, border: "#C4BBAF", label: "Up next" },
        stretch: { bg: "#FFFBEC", border: "#F5A623", label: "★ Bonus" },
        lunch: { bg: "#FFF8EC", border: "#F5A623", label: "🍽 Lunch" },
    };

    const todayDone = 2;
    const totalToday = 4;
    const streak = 5;
    const xp = 120;

    return (
        <div style={{ 
            minHeight: "100vh", 
            background: DS.cream, 
            position: "relative", 
            overflow: "hidden" 
        }}>
            <GlobalStyles />
            <Texture />
            <Deco color={profile.color} />

            {/* TOP BAR */}
            <div style={{ position: "relative", zIndex: 10, background: `${DS.card}F2`, backdropFilter: "blur(14px)", borderBottom: DS.border, padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Shadow offset={2} size={2} radius={10}>
                        <div style={{ position: "relative", width: 38, height: 38, background: profile.color, border: DS.border, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎓</div>
                    </Shadow>
                    <span className="b t-h3" style={{ color: DS.ink, fontSize: 18 }}>DADDY DASHBOARD</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Shadow offset={2} size={1.5} radius={DS.radius.sm}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, background: profile.tint, border: DS.border, borderRadius: DS.radius.sm, padding: "6px 14px" }}>
                            <span>🔥</span>
                            <span className="n t-small" style={{ fontWeight: 800, color: DS.ink }}>5 day streak!</span>
                        </div>
                    </Shadow>
                    <div 
                        className="float"
                        onClick={() => window.location.href = '/returningview'}
                        style={{ width: 38, height: 38, background: DS.card, border: DS.border, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer" }}
                    >
                        {profile.emoji}
                    </div>
                </div>
            </div>

            <div style={{ position: "relative", zIndex: 5, padding: "26px 30px" }}>
                {/* GREETING */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
                    <Shadow offset={4} size={2.5} radius={20}>
                        <div style={{ position: "relative", width: 70, height: 70, background: profile.color, border: DS.border, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>{profile.emoji}</div>
                    </Shadow>
                    <div style={{ flex: 1 }}>
                        <h1 className="b" style={{ fontSize: 38, fontWeight: 800, color: DS.ink, lineHeight: 1 }}>
                            Hey <span style={{ color: profile.color }}>{profile.name}</span>! 👋
                        </h1>
                        <p className="n t-body" style={{ color: DS.inkSoft, marginTop: 4 }}>Ready for today's adventure? Let's go! 🚀</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                        <Chip icon="✅" val={`${todayDone}/${totalToday}`} label="TODAY" color={profile.color} />
                        <Chip icon="🔥" val={`${streak} days`} label="STREAK" color="#F5A623" />
                        <Chip icon="⭐" val={`+${xp}`} label="XP" color="#9B6DD6" />
                    </div>
                </div>

                {/* TODAY'S PLAN */}
                <SectionHead label="TODAY'S PLAN" color={DS.ink} />
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, paddingTop: 8, marginBottom: 28 }}>
                    {schedule.map((item, i) => {
                        const cfg = statusCfg[item.status] || statusCfg.pending;
                        const isLunch = item.status === "lunch";
                        const isActive = item.status === "active";
                        return (
                            <Shadow key={i} offset={2} size={2} radius={DS.radius.lg} className={isActive ? "float" : ""} style={{ flexShrink: 0, overflow: "visible", marginTop: 4 }}>
                                <div 
                                    style={{ 
                                        position: "relative", 
                                        background: cfg.bg, 
                                        border: `3px solid ${cfg.border}`, 
                                        borderRadius: DS.radius.lg, 
                                        padding: isLunch ? "16px 18px" : "16px 18px", 
                                        minWidth: 148, 
                                        height: 148, 
                                        textAlign: "center", 
                                        cursor: !isLunch ? "pointer" : "default", 
                                        transition: "all .2s" 
                                    }}
                                >
                                    {isLunch ? (
                                        <>
                                            <div style={{ fontSize: 28, marginBottom: 4 }}>🍽️</div>
                                            <div className="b t-h3" style={{ color: DS.ink }}>LUNCH</div>
                                            <div className="n t-label" style={{ color: "#B87A10", marginTop: 2 }}>12 – 1PM</div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: 26, marginBottom: 6 }}>{item.icon}</div>
                                            <div className="b t-h3" style={{ color: DS.ink, marginBottom: 2 }}>{item.subject}</div>
                                            <div className="n t-label" style={{ color: DS.inkSoft, marginBottom: 10, fontWeight: 600 }}>{item.topic}</div>
                                            <Shadow offset={1} size={1.5} radius={DS.radius.pill} style={{ display: "inline-block" }}>
                                                <div style={{ position: "relative", background: cfg.border, border: DS.border, borderRadius: DS.radius.pill, padding: "2px 10px" }}>
                                                    <span className="n t-label" style={{ color: "#fff" }}>{cfg.label}</span>
                                                </div>
                                            </Shadow>
                                        </>
                                    )}
                                </div>
                            </Shadow>
                        );
                    })}
                </div>

                {/* SUBJECTS */}
                <SectionHead label="MY SUBJECTS" color={profile.color} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                    {subjects.map((s, i) => {
                        const isActive = sel === i;
                        return (
                            <div 
                                key={i}
                                className={`card-${i} subject-card`}
                                style={{ 
                                    position: "relative", 
                                    borderRadius: DS.radius.lg,
                                    transition: "transform 0.15s",
                                    cursor: "pointer"
                                }}
                            >
                                <Shadow offset={isActive ? 4 : 2} size={2} radius={DS.radius.lg}>
                                    <div 
                                        className="subject-card-inner"
                                        onClick={() => {
                                            if (s.lessonId) {
                                                window.location.href = `/lessonview?child=${childId}&lesson=${s.lessonId}`;
                                            }
                                        }}
                                        style={{ 
                                            position: "relative", 
                                            background: DS.card, 
                                            border: `3px solid ${isActive ? DS.ink : "#C4BBAF"}`, 
                                            borderRadius: DS.radius.lg, 
                                            padding: "16px 14px"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                                            <div style={{ width: 40, height: 40, background: `${s.color}20`, border: `2px solid ${s.color}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
                                            <Shadow offset={3} size={1} radius={DS.radius.pill}>
                                                <div style={{ position: "relative", background: isActive ? DS.ink : s.color, border: DS.border, borderRadius: DS.radius.pill, padding: "2px 8px" }}>
                                                    <span className="n t-label" style={{ color: "#fff" }}>{s.progress}/{s.total}</span>
                                                </div>
                                            </Shadow>
                                        </div>
                                        <div className="b t-h3" style={{ color: DS.ink, marginBottom: 2 }}>{s.name}</div>
                                        <div className="n t-label" style={{ color: DS.inkSoft, marginBottom: 10, fontWeight: 600 }}>{s.topic}</div>
                                        <div style={{ height: 7, background: "#EDE8E0", borderRadius: 100, overflow: "hidden", border: `1.5px solid ${DS.ink}` }}>
                                            <div style={{ height: "100%", width: `${(s.progress / s.total) * 100}%`, background: s.color, borderRadius: 100 }} />
                                        </div>
                                    </div>
                                </Shadow>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default KidDash;
