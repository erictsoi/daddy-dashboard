import React, { useState, Fragment } from 'react';
import { ChildProfile, ViewState } from '../types';
import { DS, GlobalStyles, Texture, Shadow, getThemeColor } from '../components/design-system';

interface AdminDashboardDemoProps {
    data: ChildProfile[];
    view: ViewState;
    setView: (view: ViewState) => void;
    isDayActive: boolean;
    generateSchedule: (hours: number) => void;
    schedule: any[];
}

const Dot = ({ status, color }: { status: string; color: string }) => {
    if (status === "done") return <span style={{ color: "#4CAF8A", fontSize: 12, fontWeight: 900 }}>✓</span>;
    if (status === "active") return <span className="blink" style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 0 3px ${color}40` }} />;
    if (status === "lunch") return <span style={{ fontSize: 12 }}>🍽️</span>;
    if (status === "stretch") return <span style={{ fontSize: 12 }}>⭐</span>;
    return <span style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid #C4BBAF`, display: "inline-block" }} />;
};

export const AdminDashboardDemo: React.FC<AdminDashboardDemoProps> = ({
    data,
    setView,
    isDayActive,
    generateSchedule
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const kids = data.slice(0, 2).map(child => {
        const colors = getThemeColor(child.themeColor);
        const subjects = child.yearGroups.flatMap(yg => yg.subjects).slice(0, 6);
        const completedCount = subjects.filter(s => s.topics.flatMap(t => t.lessons).some(l => l.completed)).length;
        
        return {
            id: child.id,
            name: child.name,
            year: child.yearGroups[0]?.name || 'Student',
            emoji: child.avatar,
            color: colors.main,
            tint: colors.tint,
            done: completedCount,
            total: subjects.length,
            streak: 5,
            subjects: subjects.map((s, i) => ({
                name: s.name,
                category: s.category,
                status: i === 0 && completedCount === 0 ? 'active' : completedCount > i ? 'done' : 'pending'
            }))
        };
    });

    const navItems = [
        { icon: "📊", label: "Overview", active: true },
        { icon: "🧒", label: "Children", active: false },
        { icon: "📈", label: "Reports", active: false },
        { icon: "⚙️", label: "Settings", active: false },
    ];

    const viewNavButtons = [
        { label: "Landing", view: { type: 'LANDING' } },
        { label: "Returning", view: { type: 'RETURNING' } },
        { label: "Admin", view: { type: 'HOME' } },
        { label: "Sophia", view: { type: 'KIDSDASH', childId: 'sophia' } },
        { label: "Adrian", view: { type: 'KIDSDASH', childId: 'adrian' } },
        { label: "Curriculum", view: { type: 'CURRICULUM_BUILDER' } },
        { label: "Lesson", view: { type: 'LESSON', childId: 'sophia', subjectId: 'demo', topicId: 'demo', lessonId: 'demo' } },
    ];

    return (
        <div style={{ display: "flex", height: "100vh", background: DS.cream, overflow: "hidden" }}>
            <GlobalStyles />
            <Texture />

            {/* Sidebar */}
            <div style={{
                width: sidebarOpen ? 240 : 68,
                background: DS.cream,
                borderRight: DS.borderThick,
                transition: "width .3s",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                padding: "22px 0"
            }}>
                <div style={{ padding: "0 16px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {sidebarOpen && <span className="b" style={{ color: DS.ink, fontWeight: 800, fontSize: 20 }}>Daddy<span style={{ color: "#F5A623" }}>.</span></span>}
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)} 
                        style={{ background: "none", border: "none", color: DS.inkSoft, cursor: "pointer", fontSize: 20, padding: 4 }}
                    >
                        ☰
                    </button>
                </div>

                {navItems.map(item => (
                    <div 
                        key={item.label}
                        style={{ 
                            padding: "11px 16px", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12, 
                            cursor: "pointer", 
                            background: item.active ? "#F0EBE3" : "transparent", 
                            borderLeft: item.active ? "4px solid #F5A623" : "4px solid transparent", 
                            transition: "all .2s" 
                        }}
                    >
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        {sidebarOpen && <span className="n t-small" style={{ color: item.active ? DS.ink : DS.inkSoft, fontWeight: item.active ? 800 : 600, whiteSpace: "nowrap" }}>{item.label}</span>}
                    </div>
                ))}

                <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: `2px solid #EDE8E0`, display: "flex", alignItems: "center", gap: 10 }}>
                    <Shadow offset={2} size={2} radius={DS.radius.sm} style={{ flexShrink: 0 }}>
                        <div style={{ position: "relative", width: 34, height: 34, borderRadius: DS.radius.sm, background: DS.card, border: DS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>👨</div>
                    </Shadow>
                    {sidebarOpen && <div>
                        <div className="n t-small" style={{ color: DS.ink, fontWeight: 700 }}>Dad</div>
                        <div className="t-label" style={{ color: DS.inkFade }}>Admin</div>
                    </div>}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
                {/* Top Nav Buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {viewNavButtons.map(btn => (
                        <button
                            key={btn.label}
                            onClick={() => setView(btn.view as ViewState)}
                            style={{
                                padding: "6px 14px",
                                background: btn.label === "Admin" ? DS.ink : DS.card,
                                color: btn.label === "Admin" ? "#fff" : DS.inkSoft,
                                border: DS.border,
                                borderRadius: DS.radius.sm,
                                cursor: "pointer",
                                fontWeight: 700,
                                fontSize: 12,
                                fontFamily: "Nunito, sans-serif"
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                    <div>
                        <h1 className="b t-h1" style={{ color: DS.ink }}>Today's Overview</h1>
                        <p className="n t-small" style={{ color: DS.inkSoft, marginTop: 3 }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <Shadow offset={2} size={2} radius={DS.radius.md}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, background: DS.card, border: DS.border, borderRadius: DS.radius.md, padding: "9px 16px" }}>
                            <span className="blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "#F5A623", flexShrink: 0 }} />
                            <span className="n t-small" style={{ color: DS.ink, fontWeight: 700 }}>Ready to start</span>
                        </div>
                    </Shadow>
                </div>

                {/* Kids Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
                    {kids.map((kid, ki) => (
                        <div key={kid.id} style={{ animation: `fadeUp .32s ${ki * .08}s ease-out both` }}>
                            <Shadow offset={3} size={2.5} radius={DS.radius.lg}>
                                <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                                        <Shadow offset={2} size={1.5} radius={13}>
                                            <div style={{ position: "relative", width: 46, height: 46, borderRadius: 13, background: kid.tint, border: DS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{kid.emoji}</div>
                                        </Shadow>
                                        <div style={{ flex: 1 }}>
                                            <div className="b t-h2" style={{ color: DS.ink }}>{kid.name}</div>
                                            <div className="n t-label" style={{ color: kid.color }}>{kid.year}</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div className="b" style={{ fontSize: 22, fontWeight: 800, color: kid.color }}>{kid.done}/{kid.total}</div>
                                            <div className="n t-label" style={{ color: DS.inkFade }}>done today</div>
                                        </div>
                                    </div>

                                    <div style={{ height: 7, background: "#EDE8F0", borderRadius: 100, marginBottom: 18, overflow: "hidden", border: "1.5px solid #1A1A2E" }}>
                                        <div style={{ height: "100%", width: `${(kid.done / kid.total) * 100}%`, background: kid.color, borderRadius: 100, transition: "width .6s" }} />
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                        {kid.subjects.map((item, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: DS.radius.sm, background: item.status === "active" ? kid.tint : "transparent", border: item.status === "active" ? `1.5px solid ${kid.color}` : "1.5px solid transparent" }}>
                                                <div style={{ width: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Dot status={item.status} color={kid.color} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div className="n t-small" style={{ fontWeight: 700, color: item.status === "done" ? DS.inkFade : DS.ink, textDecoration: item.status === "done" ? "line-through" : "none" }}>{item.name}</div>
                                                    <div className="n t-label" style={{ color: DS.inkFade }}>{item.category}</div>
                                                </div>
                                                {item.status === "active" && <span className="n t-label" style={{ color: kid.color, background: `${kid.color}18`, padding: "2px 8px", borderRadius: DS.radius.pill }}>NOW</span>}
                                                {item.status === "stretch" && <span className="n t-label" style={{ color: DS.inkFade }}>bonus</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid #EDE8E0`, display: "flex", alignItems: "center", gap: 6 }}>
                                        <span>🔥</span>
                                        <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 700 }}>{kid.streak} day streak</span>
                                    </div>
                                </div>
                            </Shadow>
                        </div>
                    ))}
                </div>

                {/* Start Session Button */}
                {!isDayActive && (
                    <div style={{ marginTop: 24, textAlign: "center" }}>
                        <Shadow offset={4} size={3} radius={DS.radius.pill}>
                            <button 
                                onClick={() => generateSchedule(5)}
                                className="b"
                                style={{ position: "relative", background: DS.ink, color: "#fff", fontWeight: 800, fontSize: 20, padding: "16px 52px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer", transition: "transform .2s" }}
                            >
                                START TODAY'S SESSION 🚀
                            </button>
                        </Shadow>
                    </div>
                )}
            </div>
        </div>
    );
};
