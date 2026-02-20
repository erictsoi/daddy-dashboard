import React from 'react';
import { getDummyProfiles } from '../src/data/dummyData';

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
    .t-h1    { font-size: 32px; font-weight: 800; line-height: 1.15; }
    .t-h2    { font-size: 22px; font-weight: 800; line-height: 1.2; }
    .t-small { font-size: 12px; font-weight: 600; line-height: 1.5; }
    .t-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes fadeUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
    .blink { animation: blink 2s ease-in-out infinite; }
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

const Shadow: React.FC<{ children: React.ReactNode; offset?: number; size?: number; radius?: number; style?: React.CSSProperties }> = ({ children, offset = 3, size = 2.5, radius, style = {} }) => (
  <div style={{ position: "relative", borderRadius: radius, ...style }}>
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

const PROFILES = getDummyProfiles();

const SCHEDULES: Record<string, any[]> = {
  sophia: [
    { subject: "Maths", topic: "Fractions", icon: "📐", status: "done" },
    { subject: "English", topic: "Creative Writing", icon: "📖", status: "done" },
    { subject: "LUNCH", topic: "", icon: "🍽️", status: "lunch" },
    { subject: "Science", topic: "Ecosystems", icon: "🔬", status: "active" },
    { subject: "Art", topic: "Watercolour", icon: "🎨", status: "pending" },
    { subject: "PE", topic: "Gymnastics", icon: "⚽", status: "stretch" },
  ],
  adrian: [
    { subject: "Maths", topic: "Algebra II", icon: "📐", status: "done" },
    { subject: "Science", topic: "Chemical Reactions", icon: "🔬", status: "done" },
    { subject: "LUNCH", topic: "", icon: "🍽️", status: "lunch" },
    { subject: "English", topic: "Essay Writing", icon: "📖", status: "active" },
    { subject: "Design", topic: "Graphic Design", icon: "✏️", status: "pending" },
  ],
};

export const AdminDash: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const kids = PROFILES.slice(0, 2).map((profile, i) => ({
    profile,
    schedule: SCHEDULES[profile.id] || SCHEDULES.sophia,
    done: 2,
    total: 4,
    streak: i === 0 ? 5 : 8,
  }));

  const Dot = ({ status, color }: { status: string; color: string }) => {
    if (status === "done") return <span style={{ color: "#4CAF8A", fontSize: 12, fontWeight: 900 }}>✓</span>;
    if (status === "active") return <span className="blink" style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 0 3px ${color}40` }} />;
    if (status === "lunch") return <span style={{ fontSize: 12 }}>🍽️</span>;
    if (status === "stretch") return <span style={{ fontSize: 12 }}>⭐</span>;
    return <span style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid #C4BBAF`, display: "inline-block" }} />;
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: DS.cream, overflow: "hidden" }}>
      <GlobalStyles />
      <Texture />

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? 240 : 68, background: DS.cream, borderRight: DS.borderThick, transition: "width .3s", flexShrink: 0, display: "flex", flexDirection: "column", padding: "22px 0" }}>
        <div style={{ padding: "0 16px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {sidebarOpen && <span className="b" style={{ color: DS.ink, fontWeight: 800, fontSize: 20 }}>Daddy<span style={{ color: "#F5A623" }}>.</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: DS.inkSoft, cursor: "pointer", fontSize: 20, padding: 4 }}>☰</button>
        </div>
        
        {/* Overview */}
        <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "#F0EBE3", borderLeft: "4px solid #F5A623", transition: "all .2s" }}>
          <span style={{ fontSize: 16 }}>📊</span>
          {sidebarOpen && <span className="n t-small" style={{ color: DS.ink, fontWeight: 800, whiteSpace: "nowrap" }}>Overview</span>}
        </div>

        {/* Kids links */}
        {PROFILES.slice(0, 2).map((profile) => (
          <div 
            key={profile.id} 
            onClick={() => window.location.href = `/kiddash?child=${profile.id}`}
            style={{ 
              padding: "11px 16px", 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              cursor: "pointer", 
              background: "transparent", 
              borderLeft: "4px solid transparent", 
              transition: "all .2s" 
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F0EBE3")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontSize: 16 }}>{profile.emoji}</span>
            {sidebarOpen && <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 600, whiteSpace: "nowrap" }}>{profile.name}</span>}
          </div>
        ))}

        {/* Reports & Settings */}
        <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, borderLeft: "4px solid transparent" }}>
          <span style={{ fontSize: 16 }}>📈</span>
          {sidebarOpen && <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 600, whiteSpace: "nowrap" }}>Reports</span>}
        </div>
        <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, borderLeft: "4px solid transparent" }}>
          <span style={{ fontSize: 16 }}>⚙️</span>
          {sidebarOpen && <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 600, whiteSpace: "nowrap" }}>Settings</span>}
        </div>

        {/* Profiles link */}
        <div onClick={() => window.location.href = '/returningview'} style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderTop: `2px solid #EDE8E0`, marginTop: 8 }}>
          <span style={{ fontSize: 16 }}>👥</span>
          {sidebarOpen && <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 600, whiteSpace: "nowrap" }}>Profiles</span>}
        </div>

        {/* Admin footer */}
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

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 className="b t-h1" style={{ color: DS.ink }}>Today's Overview</h1>
            <p className="n t-small" style={{ color: DS.inkSoft, marginTop: 3 }}>Tuesday, 17 February 2026</p>
          </div>
          <Shadow offset={2} size={2} radius={DS.radius.md}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, background: DS.card, border: DS.border, borderRadius: DS.radius.md, padding: "9px 16px" }}>
              <span className="blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "#F5A623", flexShrink: 0 }} />
              <span className="n t-small" style={{ color: DS.ink, fontWeight: 700 }}>Sophia hasn't started yet</span>
            </div>
          </Shadow>
        </div>

        {/* KIDS CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 18 }}>
          {kids.map(({ profile: pr, schedule, done, total, streak }, ki) => (
            <button 
              key={pr.id}
              onClick={() => window.location.href = `/kiddash?child=${pr.id}`}
              style={{ 
                position: "relative", 
                width: 180, 
                height: 220, 
                background: pr.color, 
                border: DS.border, 
                borderRadius: DS.radius.lg, 
                padding: "24px 16px", 
                textAlign: "center", 
                cursor: "pointer", 
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              <div style={{ background: "rgba(255, 255, 255, 0.3)", border: DS.border, borderRadius: 16, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 48, lineHeight: 1 }}>{pr.emoji}</div>
              </div>
              <div style={{ display: "inline-block", background: "rgba(255, 255, 255, 0.2)", border: "2px solid rgba(255, 255, 255, 0.5)", borderRadius: 100, padding: "2px 10px", marginBottom: 6 }}>
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>{pr.year?.toUpperCase()}</span>
              </div>
              <div className="b" style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{pr.name}</div>
              <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 12 }}>Student Access</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
