import { useState } from "react";

// ─── DESIGN SYSTEM & DATA ─────────────────────────────────────────────────────
const DS = {
  cream:    "#FAF6F0",
  card:     "#FFFFFF",
  ink:      "#1A1A2E",
  inkSoft:  "#6B6580",
  inkFade:  "#B0A8C0",
  dotBrown: "#3D2B1F",
  border:   "2.5px solid #1A1A2E",
  borderThick: "3px solid #1A1A2E",
  radius:   { sm:10, md:16, lg:22, pill:100 },
};

const PROFILES = [
  { id:"sophia", name:"Sophia", year:"Year 5", color:"#9B6DD6", tint:"#F3EEFF", emoji:"🎨" },
  { id:"adrian", name:"Adrian", year:"Year 9", color:"#2B8ED4", tint:"#EAF4FC", emoji:"🏀" },
];

const SCHEDULES = {
  sophia: [
    { subject:"Maths",   topic:"Fractions",       icon:"📐", status:"done"    },
    { subject:"English", topic:"Creative Writing", icon:"📖", status:"done"    },
    { subject:"LUNCH",   topic:"",                 icon:"🍽️", status:"lunch"   },
    { subject:"Science", topic:"Ecosystems",       icon:"🔬", status:"active"  },
    { subject:"Art",     topic:"Watercolour",      icon:"🎨", status:"pending" },
    { subject:"PE",      topic:"Gymnastics",       icon:"⚽", status:"stretch" },
  ],
  adrian: [
    { subject:"Maths",   topic:"Algebra II",        icon:"📐", status:"done"    },
    { subject:"Science", topic:"Chemical Reactions", icon:"🔬", status:"done"    },
    { subject:"LUNCH",   topic:"",                   icon:"🍽️", status:"lunch"   },
    { subject:"English", topic:"Essay Writing",      icon:"📖", status:"active"  },
    { subject:"Design",  topic:"Graphic Design",     icon:"✏️", status:"pending" },
  ]
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
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

// ─── BENDAY SHADOW ────────────────────────────────────────────────────────────
const BendayShadow = ({ offset = 3, size = 2.5 }) => (
  <div style={{
    position: "absolute", top: offset, left: offset, right: -offset, bottom: -offset,
    zIndex: -1, pointerEvents: "none",
    backgroundImage: `radial-gradient(circle, ${DS.dotBrown} ${size}px, transparent ${size}px)`,
    backgroundSize: `${size * 2.2}px ${size * 2.2}px`,
    borderRadius: "inherit", opacity: 0.35,
  }} />
);

const Shadow = ({ children, offset = 3, size = 2.5, radius, style = {} }) => (
  <div style={{ position: "relative", borderRadius: radius, ...style }}>
    <BendayShadow offset={offset} size={size} />
    {children}
  </div>
);

// ─── TEXTURE ──────────────────────────────────────────────────────────────────
const Texture = () => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `radial-gradient(circle, #1A1A2E08 1px, transparent 1px)`,
    backgroundSize: "20px 20px"
  }} />
);

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [open, setOpen] = useState(true);
  
  const kids = [
    { profile: PROFILES[0], schedule: SCHEDULES.sophia, done: 2, total: 4, streak: 5 },
    { profile: PROFILES[1], schedule: SCHEDULES.adrian, done: 2, total: 4, streak: 8 },
  ];

  const Dot = ({ status, color }) => {
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

      {/* SIDEBAR — cream with strong border */}
      <div style={{ width: open ? 240 : 68, background: DS.cream, borderRight: DS.borderThick, transition: "width .3s", flexShrink: 0, display: "flex", flexDirection: "column", padding: "22px 0" }}>
        <div style={{ padding: "0 16px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {open && <span className="b" style={{ color: DS.ink, fontWeight: 800, fontSize: 20 }}>Daddy<span style={{ color: "#F5A623" }}>.</span></span>}
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: DS.inkSoft, cursor: "pointer", fontSize: 20, padding: 4 }}>☰</button>
        </div>
        {[["📊", "Overview"], ["🎨", "Sophia"], ["🏀", "Adrian"], ["📈", "Reports"], ["⚙️", "Settings"]].map(([icon, label], i) => (
          <div key={label} style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: i === 0 ? "#F0EBE3" : "transparent", borderLeft: i === 0 ? "4px solid #F5A623" : "4px solid transparent", transition: "all .2s" }}
            onMouseEnter={e => i !== 0 && (e.currentTarget.style.background = "#F0EBE3")}
            onMouseLeave={e => i !== 0 && (e.currentTarget.style.background = "transparent")}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            {open && <span className="n t-small" style={{ color: i === 0 ? DS.ink : DS.inkSoft, fontWeight: i === 0 ? 800 : 600, whiteSpace: "nowrap" }}>{label}</span>}
          </div>
        ))}
        <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: `2px solid #EDE8E0`, display: "flex", alignItems: "center", gap: 10 }}>
          <Shadow offset={2} size={2} radius={DS.radius.sm} style={{ flexShrink: 0 }}>
            <div style={{ position: "relative", width: 34, height: 34, borderRadius: DS.radius.sm, background: DS.card, border: DS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>👨</div>
          </Shadow>
          {open && <div>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          {kids.map(({ profile: pr, schedule, done, total, streak }, ki) => (
            <Shadow key={pr.id} offset={3} size={2.5} radius={DS.radius.lg} style={{ animation: `fadeUp .32s ${ki * .08}s ease-out both` }}>
              <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <Shadow offset={2} size={1.5} radius={13}>
                    <div style={{ position: "relative", width: 46, height: 46, borderRadius: 13, background: pr.tint, border: DS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{pr.emoji}</div>
                  </Shadow>
                  <div style={{ flex: 1 }}>
                    <div className="b t-h2" style={{ color: DS.ink }}>{pr.name}</div>
                    <div className="n t-label" style={{ color: pr.color }}>{pr.year}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="b" style={{ fontSize: 22, fontWeight: 800, color: pr.color }}>{done}/{total}</div>
                    <div className="n t-label" style={{ color: DS.inkFade }}>done today</div>
                  </div>
                </div>

                <div style={{ height: 7, background: "#EDE8F0", borderRadius: 100, marginBottom: 18, overflow: "hidden", border: "1.5px solid #1A1A2E" }}>
                  <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: pr.color, borderRadius: 100, transition: "width .6s" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {schedule.map((item, i) =>
                    item.status === "lunch"
                      ? <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "#EDE8F0" }} />
                        <span className="n t-label" style={{ color: DS.inkFade }}>LUNCH 12–1PM</span>
                        <div style={{ flex: 1, height: 1, background: "#EDE8F0" }} />
                      </div>
                      : <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: DS.radius.sm, background: item.status === "active" ? pr.tint : "transparent", border: item.status === "active" ? `1.5px solid ${pr.color}` : "1.5px solid transparent" }}>
                        <div style={{ width: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Dot status={item.status} color={pr.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="n t-small" style={{ fontWeight: 700, color: item.status === "done" ? DS.inkFade : DS.ink, textDecoration: item.status === "done" ? "line-through" : "none" }}>{item.subject}</div>
                          <div className="n t-label" style={{ color: DS.inkFade }}>{item.topic}</div>
                        </div>
                        {item.status === "active" && <span className="n t-label" style={{ color: pr.color, background: `${pr.color}18`, padding: "2px 8px", borderRadius: DS.radius.pill }}>NOW</span>}
                        {item.status === "stretch" && <span className="n t-label" style={{ color: DS.inkFade }}>bonus</span>}
                      </div>
                  )}
                </div>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid #EDE8F0`, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🔥</span>
                  <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 700 }}>{streak} day streak</span>
                </div>
              </div>
            </Shadow>
          ))}
        </div>
      </div>
    </div>
  );
}
