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
  radius:   { sm:10, md:16, lg:22, pill:100 },
};

const PROFILE = { name:"Sophia", year:"Year 5", color:"#9B6DD6", tint:"#F3EEFF", emoji:"🎨" };

const SCHEDULE = [
  { subject:"Maths",   topic:"Fractions",       icon:"📐", status:"done"    },
  { subject:"English", topic:"Creative Writing", icon:"📖", status:"done"    },
  { subject:"LUNCH",   topic:"",                 icon:"🍽️", status:"lunch"   },
  { subject:"Science", topic:"Ecosystems",       icon:"🔬", status:"active"  },
  { subject:"Art",     topic:"Watercolour",      icon:"🎨", status:"pending" },
  { subject:"PE",      topic:"Gymnastics",       icon:"⚽", status:"stretch" },
];

const SUBJECTS = [
  { name:"Maths",      icon:"📐", progress:7,  total:15, topic:"Fractions",       color:"#FF6B6B" },
  { name:"English",    icon:"📖", progress:12, total:18, topic:"Creative Writing", color:"#4CAF8A" },
  { name:"Science",    icon:"🔬", progress:3,  total:12, topic:"Ecosystems",       color:"#2B8ED4" },
  { name:"Art",        icon:"🎨", progress:9,  total:10, topic:"Watercolour",      color:"#F5A623" },
  { name:"Music",      icon:"🎵", progress:5,  total:8,  topic:"Rhythm & Beat",   color:"#9B6DD6" },
  { name:"PE",         icon:"⚽", progress:14, total:20, topic:"Gymnastics",       color:"#4CAF8A" },
  { name:"History",    icon:"🏛️", progress:2,  total:10, topic:"Ancient Egypt",   color:"#E8507A" },
  { name:"Geography",  icon:"🌍", progress:6,  total:12, topic:"Weather Systems",  color:"#2B8ED4" },
  { name:"Drama",      icon:"🎭", progress:4,  total:8,  topic:"Improvisation",    color:"#F5A623" },
  { name:"Technology", icon:"💻", progress:1,  total:10, topic:"Intro to Coding",  color:"#9B6DD6" },
  { name:"Languages",  icon:"🗣️", progress:8,  total:15, topic:"French Basics",   color:"#FF6B6B" },
  { name:"PSHE",       icon:"💛", progress:3,  total:6,  topic:"Wellbeing",        color:"#4CAF8A" },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
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

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const Texture = () => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `radial-gradient(circle, #1A1A2E08 1px, transparent 1px)`,
    backgroundSize: "20px 20px"
  }} />
);

const Blobs = ({ color }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    <div style={{ position: "absolute", top: "-12%", right: "-4%", width: 380, height: 380, borderRadius: "50%", background: color, opacity: .06, filter: "blur(64px)" }} />
    <div style={{ position: "absolute", bottom: "-5%", left: "-8%", width: 300, height: 300, borderRadius: "50%", background: color, opacity: .04, filter: "blur(52px)" }} />
  </div>
);

const Deco = ({ color }) => (
  <>
    <Blobs color={color} />
    {[{ t: "⭐", x: 4, y: 7, s: 26 }, { t: "✨", x: 87, y: 9, s: 20 }, { t: "🚀", x: 2, y: 48, s: 22 }, { t: "💫", x: 93, y: 72, s: 18 }, { t: "⭐", x: 47, y: 3, s: 15 }, { t: "🌈", x: 90, y: 46, s: 24 }]
      .map((d, i) => (
        <div key={i} style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, fontSize: d.s, opacity: .14, pointerEvents: "none", zIndex: 0, animation: `float ${2.6 + i * .35}s ease-in-out ${i * .18}s infinite` }}>{d.t}</div>
      ))}
  </>
);

const Chip = ({ icon, val, label, color }) => (
  <Shadow offset={3} size={2.5} radius={DS.radius.md}>
    <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.md, padding: "10px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
      <div className="b t-h3" style={{ color }}>{val}</div>
      <div className="n t-label" style={{ color: DS.inkFade }}>{label}</div>
    </div>
  </Shadow>
);

const SectionHead = ({ label, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
    <Shadow offset={2} size={2} radius={DS.radius.sm} style={{ display: "inline-block" }}>
      <div style={{ position: "relative", background: color, border: DS.border, borderRadius: DS.radius.sm, padding: "4px 16px" }}>
        <span className="b t-label" style={{ color: "#fff" }}>{label}</span>
      </div>
    </Shadow>
    <div style={{ flex: 1, height: 2, background: `${DS.ink}18`, borderRadius: 100 }} />
  </div>
);

// ─── KIDS DASHBOARD ───────────────────────────────────────────────────────────
export default function KidsDashboard() {
  const [sel, setSel] = useState(null);
  const pr = PROFILE;

  const statusCfg = {
    done: { bg: "#E8F8F0", border: "#4CAF8A", label: "✓ Done" },
    active: { bg: pr.tint, border: pr.color, label: "● Now" },
    pending: { bg: DS.card, border: "#C4BBAF", label: "Up next" },
    stretch: { bg: "#FFFBEC", border: "#F5A623", label: "★ Bonus" },
    lunch: { bg: "#FFF8EC", border: "#F5A623", label: "🍽 Lunch" },
  };

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
      <GlobalStyles />
      <Texture />
      <Deco color={pr.color} />

      {/* TOP BAR */}
      <div style={{ position: "relative", zIndex: 10, background: `${DS.card}F2`, backdropFilter: "blur(14px)", borderBottom: DS.border, padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shadow offset={2} size={2} radius={10}>
            <div style={{ position: "relative", width: 38, height: 38, background: pr.color, border: DS.border, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎓</div>
          </Shadow>
          <span className="b t-h3" style={{ color: DS.ink, fontSize: 18 }}>DADDY DASHBOARD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shadow offset={2} size={1.5} radius={DS.radius.sm}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, background: pr.tint, border: DS.border, borderRadius: DS.radius.sm, padding: "6px 14px" }}>
              <span>🔥</span>
              <span className="n t-small" style={{ fontWeight: 800, color: DS.ink }}>5 day streak!</span>
            </div>
          </Shadow>
          <div style={{ width: 38, height: 38, background: DS.card, border: DS.border, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer" }} className="float">{pr.emoji}</div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 5, padding: "26px 30px" }}>
        {/* GREETING */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <Shadow offset={4} size={2.5} radius={20}>
            <div style={{ position: "relative", width: 70, height: 70, background: pr.color, border: DS.border, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }} className="float">{pr.emoji}</div>
          </Shadow>
          <div style={{ flex: 1 }}>
            <h1 className="b" style={{ fontSize: 38, fontWeight: 800, color: DS.ink, lineHeight: 1 }}>
              Hey <span style={{ color: pr.color }}>{pr.name}</span>! 👋
            </h1>
            <p className="n t-body" style={{ color: DS.inkSoft, marginTop: 4 }}>Ready for today's adventure? Let's go! 🚀</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <Chip icon="✅" val="2/4" label="TODAY" color={pr.color} />
            <Chip icon="🔥" val="5 days" label="STREAK" color="#F5A623" />
            <Chip icon="⭐" val="+120" label="XP" color="#9B6DD6" />
          </div>
        </div>

        {/* TODAY'S PLAN */}
        <SectionHead label="TODAY'S PLAN" color={DS.ink} />
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, marginBottom: 28 }}>
          {SCHEDULE.map((item, i) => {
            const cfg = statusCfg[item.status] || statusCfg.pending;
            const isLunch = item.status === "lunch";
            const isActive = item.status === "active";
            return (
              <Shadow key={i} offset={isActive ? 4 : 2} size={2} radius={DS.radius.lg} style={{ flexShrink: 0 }}>
                <div style={{ position: "relative", background: cfg.bg, border: `3px solid ${cfg.border}`, borderRadius: DS.radius.lg, padding: isLunch ? "14px 20px" : "16px 18px", minWidth: isLunch ? 100 : 148, textAlign: "center", cursor: !isLunch ? "pointer" : "default", transform: isActive ? "translateY(-5px)" : "none", transition: "all .2s" }}
                  onMouseEnter={e => !isLunch && (e.currentTarget.style.transform = "translateY(-5px)")}
                  onMouseLeave={e => !isLunch && (e.currentTarget.style.transform = isActive ? "translateY(-5px)" : "none")}>
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
        <SectionHead label="MY SUBJECTS" color={pr.color} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {SUBJECTS.map((s, i) => {
            const isActive = sel === i;
            return (
              <Shadow key={i} offset={isActive ? 4 : 2} size={2} radius={DS.radius.lg} className={`card-${i}`}>
                <div onClick={() => setSel(isActive ? null : i)}
                  style={{ position: "relative", background: DS.card, border: `3px solid ${isActive ? DS.ink : "#C4BBAF"}`, borderRadius: DS.radius.lg, padding: "16px 14px", cursor: "pointer", transform: isActive ? "translateY(-3px)" : "none", transition: "all .2s" }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = DS.ink; e.currentTarget.style.transform = "translateY(-2px)" } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "#C4BBAF"; e.currentTarget.style.transform = "none" } }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, background: `${s.color}20`, border: `2px solid ${s.color}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
                    <Shadow offset={1} size={1} radius={DS.radius.pill}>
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
                  {isActive && (
                    <Shadow offset={2} size={1.5} radius={DS.radius.pill} style={{ marginTop: 10 }}>
                      <button className="b"
                        style={{ position: "relative", width: "100%", background: s.color, border: DS.border, borderRadius: DS.radius.pill, padding: "7px 0", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translate(-1px,-1px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "none"}>GO! →</button>
                    </Shadow>
                  )}
                </div>
              </Shadow>
            );
          })}
        </div>
      </div>
    </div>
  );
}
