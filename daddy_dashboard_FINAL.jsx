import { useState, useEffect } from "react";

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
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
  { id:"amara",  name:"Amara",  year:"Year 1",  age:"5–6",   color:"#FF6B6B", tint:"#FFF0F0", emoji:"🦋", interests:["Animals","Drawing","Singing","Nature"]       },
  { id:"marcus", name:"Marcus", year:"Year 3",  age:"7–8",   color:"#4CAF8A", tint:"#EDFAF4", emoji:"🦖", interests:["Dinosaurs","Football","Building","Comics"]    },
  { id:"sophia", name:"Sophia", year:"Year 5",  age:"9–10",  color:"#9B6DD6", tint:"#F3EEFF", emoji:"🎨", interests:["Art","Dance","Music","Sports"]                },
  { id:"kai",    name:"Kai",    year:"Year 7",  age:"11–12", color:"#F5A623", tint:"#FFF8EC", emoji:"🛹", interests:["Gaming","Skateboarding","History","Film"]     },
  { id:"adrian", name:"Adrian", year:"Year 9",  age:"13–14", color:"#2B8ED4", tint:"#EAF4FC", emoji:"🏀", interests:["Design","Maths","Science","Basketball"]       },
  { id:"rohan",  name:"Rohan",  year:"Year 11", age:"15–16", color:"#E8507A", tint:"#FFF0F5", emoji:"📸", interests:["Coding","Photography","Film","Economics"]     },
];

const SOPHIA = PROFILES[2];
const ADRIAN = PROFILES[4];

const SCHEDULE_SOPHIA = [
  { subject:"Maths",   topic:"Fractions",       icon:"📐", status:"done"    },
  { subject:"English", topic:"Creative Writing", icon:"📖", status:"done"    },
  { subject:"LUNCH",   topic:"",                 icon:"🍽️", status:"lunch"   },
  { subject:"Science", topic:"Ecosystems",       icon:"🔬", status:"active"  },
  { subject:"Art",     topic:"Watercolour",      icon:"🎨", status:"pending" },
  { subject:"PE",      topic:"Gymnastics",       icon:"⚽", status:"stretch" },
];

const SCHEDULE_ADRIAN = [
  { subject:"Maths",   topic:"Algebra II",        icon:"📐", status:"done"    },
  { subject:"Science", topic:"Chemical Reactions", icon:"🔬", status:"done"    },
  { subject:"LUNCH",   topic:"",                   icon:"🍽️", status:"lunch"   },
  { subject:"English", topic:"Essay Writing",      icon:"📖", status:"active"  },
  { subject:"Design",  topic:"Graphic Design",     icon:"✏️", status:"pending" },
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

const PLAYLIST = [
  { title:"What is an Ecosystem?",              duration:"7:20",  done:true          },
  { title:"Producers, Consumers & Decomposers", duration:"9:15",  done:true          },
  { title:"Food Chains Explained",              duration:"11:40", done:false, active:true },
  { title:"Food Webs & Energy Flow",            duration:"8:30",  done:false         },
  { title:"Ecosystems Under Threat",            duration:"12:10", done:false         },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { font-family: 'Nunito Sans', sans-serif; background: #FAF6F0; color: #1A1A2E; }
    .b  { font-family: 'Baloo 2', cursive; }
    .n  { font-family: 'Nunito', sans-serif; }
    .ns { font-family: 'Nunito Sans', sans-serif; }

    .t-hero  { font-size: 56px; font-weight: 800; line-height: 1.0; }
    .t-h1    { font-size: 32px; font-weight: 800; line-height: 1.15; }
    .t-h2    { font-size: 22px; font-weight: 800; line-height: 1.2; }
    .t-h3    { font-size: 16px; font-weight: 800; line-height: 1.3; }
    .t-body  { font-size: 14px; font-weight: 500; line-height: 1.65; }
    .t-small { font-size: 12px; font-weight: 600; line-height: 1.5; }
    .t-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }

    @keyframes float  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-7px)} }
    @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes pop    { from{transform:scale(.88);opacity:0} to{transform:scale(1);opacity:1} }
    @keyframes slide  { from{transform:translateX(24px);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes fadeUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }

    .float  { animation: float  3s   ease-in-out infinite; }
    .blink  { animation: blink  2s   ease-in-out infinite; }
    .pop    { animation: pop    .3s  cubic-bezier(.34,1.56,.64,1) forwards; }
    .slide  { animation: slide  .28s ease-out forwards; }

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

const tabs = ["🏠 Landing", "👤 Returning", "👨 Admin", "🧒 Kids", "🎬 Lesson"];

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
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `radial-gradient(circle, #1A1A2E08 1px, transparent 1px)`,
    backgroundSize: "20px 20px" }} />
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

const Tag = ({ label, color, dark = false }) => (
  <Shadow offset={2} size={2} radius={DS.radius.pill} style={{ display: "inline-block" }}>
    <div style={{ position: "relative", background: dark ? DS.ink : color, border: DS.border, borderRadius: DS.radius.pill, padding: "3px 13px" }}>
      <span className="n t-label" style={{ color: "#fff" }}>{label}</span>
    </div>
  </Shadow>
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

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing() {
  const [active, setActive] = useState(2);
  const p = PROFILES[active];

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
      <G /><Texture /><Deco color={p.color} />

      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", borderBottom: DS.border, background: `${DS.card}F0`, backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shadow offset={3} size={2.5} radius={12}>
            <div style={{ position: "relative", width: 40, height: 40, background: p.color, border: DS.border, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "background .35s" }}>🎓</div>
          </Shadow>
          <span className="b t-h2" style={{ color: DS.ink }}>DADDY DASHBOARD</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span className="n t-small" style={{ color: DS.ink, cursor: "pointer", fontWeight: 700 }}>HOW IT WORKS</span>
          <Shadow offset={3} size={2.5} radius={DS.radius.pill}>
            <button className="n" style={{ position: "relative", background: DS.ink, color: "#fff", fontWeight: 800, fontSize: 13, padding: "9px 22px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer" }}>SIGN IN</button>
          </Shadow>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "44px 40px 8px" }}>
        <h1 className="b t-hero" style={{ color: DS.ink, marginBottom: 8 }}>Who's ready for an</h1>
        <Shadow offset={5} size={3} radius={DS.radius.md} style={{ display: "inline-block" }}>
          <div style={{ position: "relative", background: p.color, border: DS.border, borderRadius: DS.radius.md, padding: "4px 32px", marginBottom: 12, transition: "background .35s" }}>
            <span className="b" style={{ fontSize: 56, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>ADVENTURE?</span>
          </div>
        </Shadow>
        <p className="n" style={{ fontSize: 17, fontWeight: 700, color: DS.inkSoft, marginTop: 12, marginBottom: 32 }}>Pick your hero to start your learning mission!</p>
      </div>

      <div style={{ position: "relative", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, padding: "0 56px", marginBottom: 24 }}>
        <Shadow offset={3} size={2.5} radius="50%">
          <button onClick={() => setActive(a => (a - 1 + PROFILES.length) % PROFILES.length)}
            style={{ position: "relative", width: 52, height: 52, borderRadius: "50%", border: DS.border, background: DS.card, fontSize: 20, cursor: "pointer", color: DS.ink, transition: "transform .15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>←</button>
        </Shadow>

        <div style={{ position: "relative", height: 380, width: 280, flexShrink: 0 }}>
          {PROFILES.map((pr, i) => {
            const off = ((i - active) + PROFILES.length) % PROFILES.length;
            const dist = off > PROFILES.length / 2 ? off - PROFILES.length : off;
            const abs = Math.abs(dist);
            if (abs > 2) return null;
            const isA = dist === 0;
            return (
              <div key={pr.id} onClick={() => !isA && setActive(i)}
                style={{ position: "absolute", left: "50%", top: 0, transform: `translateX(calc(-50% + ${dist * 182}px)) scale(${1 - abs * .17})`, zIndex: 10 - abs, opacity: isA ? 1 : 1 - abs * .4, transition: "all .44s cubic-bezier(.34,1.56,.64,1)", cursor: isA ? "default" : "pointer", transformOrigin: "center top" }}>
                <Shadow offset={isA ? 5 : 3} size={isA ? 3 : 2.5} radius={DS.radius.lg}>
                  <div style={{ position: "relative", width: 268, background: isA ? pr.color : DS.cream, border: DS.border, borderRadius: DS.radius.lg, padding: isA ? "24px 20px 20px" : "16px", transition: "all .4s" }}>
                    {isA && (
                      <div style={{ position: "absolute", top: -14, right: 14 }}>
                        <Shadow offset={2} size={2} radius={DS.radius.pill}>
                          <div style={{ position: "relative", background: "#FF6B6B", color: "#fff", fontSize: 11, fontWeight: 900, padding: "4px 14px", borderRadius: DS.radius.pill, border: DS.border, fontFamily: "Nunito,sans-serif", letterSpacing: .5 }}>★ ACTIVE</div>
                        </Shadow>
                      </div>
                    )}
                    <div style={{ background: "rgba(255,255,255,.3)", border: DS.border, borderRadius: DS.radius.md, padding: 10, marginBottom: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 54, lineHeight: 1 }}>{pr.emoji}</div>
                    </div>
                    <Tag label={pr.year} color={pr.color} dark />
                    <div className="b" style={{ fontSize: 34, fontWeight: 800, color: isA ? "#fff" : DS.ink, marginTop: 10, marginBottom: 10 }}>{pr.name}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {pr.interests.slice(0, 3).map(int => (
                        <span key={int} style={{ background: "rgba(255,255,255,.38)", border: `2px solid ${isA ? "rgba(255,255,255,.6)" : DS.ink}`, borderRadius: DS.radius.pill, padding: "2px 10px", fontSize: 10, fontWeight: 800, color: isA ? "#fff" : DS.ink, fontFamily: "Nunito,sans-serif" }}>{int.toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                </Shadow>
              </div>
            );
          })}
        </div>

        <Shadow offset={3} size={2.5} radius="50%">
          <button onClick={() => setActive(a => (a + 1) % PROFILES.length)}
            style={{ position: "relative", width: 52, height: 52, borderRadius: "50%", border: DS.border, background: DS.card, fontSize: 20, cursor: "pointer", color: DS.ink, transition: "transform .15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>→</button>
        </Shadow>
      </div>

      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "0 40px 52px" }}>
        <p className="b" style={{ fontSize: 20, fontWeight: 700, color: DS.ink, marginBottom: 6 }}>
          "Welcome back,{" "}
          <span style={{ background: p.color, color: "#fff", padding: "1px 12px", borderRadius: DS.radius.sm, border: DS.border }}>{p.name}</span>!
          {" "}Ready to learn something amazing?"
        </p>
        <p className="n t-small" style={{ color: DS.inkFade, marginBottom: 26 }}>Choose the profile closest to your child</p>
        <Shadow offset={4} size={3} radius={DS.radius.pill} style={{ display: "inline-block" }}>
          <button className="b"
            style={{ position: "relative", background: p.color, color: "#fff", fontWeight: 800, fontSize: 20, padding: "16px 52px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer", transition: "transform .2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>START LEARNING 🚀</button>
        </Shadow>
        <div style={{ marginTop: 12 }}>
          <span className="n t-small" style={{ color: DS.inkFade }}>Not you? </span>
          <span className="n t-small" style={{ color: p.color, fontWeight: 800, cursor: "pointer", borderBottom: `2.5px solid ${p.color}` }}>Switch Hero</span>
        </div>
      </div>
    </div>
  );
}

// ─── RETURNING ────────────────────────────────────────────────────────────────
function Returning() {
  const cards = [
    { name: "Dad", role: "ADMIN", emoji: "👨", color: "#5B6DD4", tint: "#ECEEFF" },
    { name: "Sophia", role: "YEAR 5", emoji: "🎨", color: "#9B6DD6", tint: "#F3EEFF", streak: 5 },
    { name: "Adrian", role: "YEAR 9", emoji: "🏀", color: "#2B8ED4", tint: "#EAF4FC", streak: 8 },
  ];
  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <G /><Texture /><Deco color="#9B6DD6" />
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", marginBottom: 44 }}>
        <h1 className="b t-h1" style={{ color: DS.ink, marginBottom: 6, fontSize: 46 }}>Welcome back! 👋</h1>
        <p className="n" style={{ fontSize: 16, fontWeight: 700, color: DS.inkSoft }}>Who's learning today?</p>
      </div>
      <div style={{ position: "relative", zIndex: 5, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {cards.map(c => (
          <Shadow key={c.name} offset={4} size={2.5} radius={DS.radius.lg}>
            <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: "32px 28px", width: 200, textAlign: "center", cursor: "pointer", transition: "transform .18s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translate(-3px,-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <Shadow offset={2} size={2} radius={DS.radius.md} style={{ margin: "0 auto 14px", width: 64 }}>
                <div style={{ position: "relative", width: 64, height: 64, borderRadius: DS.radius.md, background: c.tint, border: DS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{c.emoji}</div>
              </Shadow>
              <div className="b t-h2" style={{ color: DS.ink, marginBottom: 8 }}>{c.name}</div>
              <Tag label={c.role} color={c.color} />
              {c.streak && (
                <Shadow offset={2} size={1.5} radius={DS.radius.sm} style={{ marginTop: 12 }}>
                  <div style={{ position: "relative", background: c.tint, border: DS.border, borderRadius: DS.radius.sm, padding: "7px 0" }}>
                    <span className="n t-small" style={{ fontWeight: 800, color: c.color }}>🔥 {c.streak} day streak</span>
                  </div>
                </Shadow>
              )}
            </div>
          </Shadow>
        ))}
        <div style={{ border: `2.5px dashed #C4BBAF`, borderRadius: DS.radius.lg, padding: "32px 28px", width: 200, textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: .55, transition: "opacity .2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = ".55"}>
          <div style={{ width: 50, height: 50, borderRadius: DS.radius.md, background: "#EDE8E0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>＋</div>
          <span className="n t-small" style={{ color: DS.inkFade }}>Add a child</span>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function Admin() {
  const [open, setOpen] = useState(true);
  const kids = [
    { profile: SOPHIA, schedule: SCHEDULE_SOPHIA, done: 2, total: 4, streak: 5 },
    { profile: ADRIAN, schedule: SCHEDULE_ADRIAN, done: 2, total: 4, streak: 8 },
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
      <G /><Texture />

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

// ─── KIDS DASH ────────────────────────────────────────────────────────────────
function KidsDash() {
  const pr = SOPHIA;
  const [sel, setSel] = useState(null);

  const statusCfg = {
    done: { bg: "#E8F8F0", border: "#4CAF8A", label: "✓ Done" },
    active: { bg: pr.tint, border: pr.color, label: "● Now" },
    pending: { bg: DS.card, border: "#C4BBAF", label: "Up next" },
    stretch: { bg: "#FFFBEC", border: "#F5A623", label: "★ Bonus" },
    lunch: { bg: "#FFF8EC", border: "#F5A623", label: "🍽 Lunch" },
  };

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
      <G /><Texture /><Deco color={pr.color} />

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

        <SectionHead label="TODAY'S PLAN" color={DS.ink} />
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, marginBottom: 28 }}>
          {SCHEDULE_SOPHIA.map((item, i) => {
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

// ─── LESSON ───────────────────────────────────────────────────────────────────
function Lesson() {
  const pr = SOPHIA;
  const [elapsed, setElapsed] = useState(843);
  const [running, setRunning] = useState(true);
  const [vidEnd, setVidEnd] = useState(false);
  const [done, setDone] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);

  useEffect(() => {
    if (!running || done) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [running, done]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ height: "100vh", background: DS.cream, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <G /><Texture /><Blobs color={pr.color} />

      <div style={{ position: "relative", zIndex: 10, background: `${DS.card}F4`, backdropFilter: "blur(14px)", borderBottom: DS.border, padding: "12px 24px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <Shadow offset={2} size={2} radius={DS.radius.pill}>
          <button className="b"
            style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, background: pr.tint, border: DS.border, borderRadius: DS.radius.pill, padding: "8px 18px", cursor: "pointer", fontWeight: 800, fontSize: 14, color: DS.ink, flexShrink: 0, transition: "transform .15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translate(-1px,-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>← Dashboard</button>
        </Shadow>

        <div style={{ flex: 1 }}>
          <div className="n t-label" style={{ color: pr.color }}>Science · Ecosystems</div>
          <div className="b t-h2" style={{ color: DS.ink }}>Food Chains Explained</div>
        </div>

        <Shadow offset={3} size={2.5} radius={DS.radius.md}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, background: pr.color, border: DS.border, borderRadius: DS.radius.md, padding: "10px 16px" }}>
            <div>
              <div className="b" style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{fmt(elapsed)}</div>
              <div className="n t-label" style={{ color: "rgba(255,255,255,.65)" }}>elapsed</div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={() => setRunning(!running)}
                style={{ width: 32, height: 32, borderRadius: DS.radius.sm, border: "2px solid rgba(255,255,255,.5)", background: "rgba(255,255,255,.2)", color: "#fff", cursor: "pointer", fontSize: 13, backdropFilter: "blur(4px)" }}>
                {running ? "⏸" : "▶"}
              </button>
              <button onClick={() => setElapsed(e => e + 600)}
                style={{ width: 32, height: 32, borderRadius: DS.radius.sm, border: "2px solid rgba(255,255,255,.5)", background: "rgba(255,255,255,.2)", color: "#fff", cursor: "pointer", fontSize: 9, fontWeight: 900, fontFamily: "Nunito,sans-serif", backdropFilter: "blur(4px)" }}>+10</button>
            </div>
          </div>
        </Shadow>

        <Shadow offset={2} size={2} radius={DS.radius.sm}>
          <button onClick={() => setInfoOpen(!infoOpen)}
            style={{ position: "relative", width: 40, height: 40, borderRadius: DS.radius.sm, border: DS.border, background: infoOpen ? pr.color : DS.card, color: infoOpen ? "#fff" : DS.ink, cursor: "pointer", fontSize: 16, fontWeight: 800, flexShrink: 0, transition: "all .2s" }}>ℹ</button>
        </Shadow>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16, overflow: "auto" }}>
          <Shadow offset={5} size={3} radius={DS.radius.lg}>
            <div style={{ position: "relative", background: "#0F0D2A", border: DS.border, borderRadius: DS.radius.lg, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${pr.color}28,transparent)` }} />
              <div style={{ textAlign: "center", zIndex: 1 }}>
                <div style={{ fontSize: 50, marginBottom: 10 }}>▶</div>
                <div className="n t-body" style={{ color: "#fff", opacity: .8 }}>YouTube Video Player</div>
                <div className="n t-label" style={{ color: "rgba(255,255,255,.4)", marginTop: 4 }}>Food Chains Explained · 11:40</div>
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "rgba(255,255,255,.15)" }}>
                <div style={{ width: "42%", height: "100%", background: pr.color }} />
              </div>
              {!vidEnd && (
                <button onClick={() => setVidEnd(true)}
                  style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(255,255,255,.15)", border: "2px solid rgba(255,255,255,.35)", color: "#fff", padding: "6px 16px", borderRadius: DS.radius.pill, fontSize: 11, cursor: "pointer", fontWeight: 800, fontFamily: "Nunito,sans-serif", backdropFilter: "blur(6px)" }}>
                  Simulate video end ▸
                </button>
              )}
            </div>
          </Shadow>

          {!done ? (
            <div>
              <Shadow offset={vidEnd ? 3 : 0} size={2.5} radius={DS.radius.pill} style={{ display: "inline-block" }}>
                <button disabled={!vidEnd} onClick={() => setDone(true)} className="b"
                  style={{ position: "relative", padding: "14px 40px", borderRadius: DS.radius.pill, border: vidEnd ? DS.border : `2.5px solid #C4BBAF`, background: vidEnd ? pr.color : "#EDE8E0", color: vidEnd ? "#fff" : DS.inkFade, fontSize: 18, fontWeight: 800, cursor: vidEnd ? "pointer" : "not-allowed", transition: "transform .2s" }}
                  onMouseEnter={e => vidEnd && (e.currentTarget.style.transform = "translate(-2px,-2px)")}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                  {vidEnd ? "✓ Mark Complete!" : "Finish the video first 👀"}
                </button>
              </Shadow>
              {!vidEnd && <p className="n t-small" style={{ color: pr.color, marginTop: 6, fontWeight: 700 }}>Button unlocks when the video ends</p>}
            </div>
          ) : (
            <Shadow offset={3} size={2.5} radius={DS.radius.md} style={{ display: "inline-block" }} className="pop">
              <div style={{ position: "relative", background: "#E8F8F0", border: `3px solid #4CAF8A`, borderRadius: DS.radius.md, padding: "14px 22px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>🎉</span>
                <div>
                  <div className="b t-h2" style={{ color: "#2D7A5E" }}>Awesome! Lesson complete!</div>
                  <div className="n t-small" style={{ color: "#4CAF8A", marginTop: 2 }}>Loading next video...</div>
                </div>
              </div>
            </Shadow>
          )}
        </div>

        {infoOpen && (
          <div style={{ width: 285, background: DS.card, borderLeft: DS.border, padding: 20, overflow: "auto", display: "flex", flexDirection: "column", gap: 18, flexShrink: 0 }} className="slide">
            <div>
              <div className="n t-label" style={{ color: pr.color, marginBottom: 7 }}>About this lesson</div>
              <p className="ns t-body" style={{ color: DS.inkSoft }}>Discover how energy moves through ecosystems via food chains — from producers right up to apex predators.</p>
            </div>
            <div>
              <div className="n t-label" style={{ color: pr.color, marginBottom: 7 }}>Learning outcomes</div>
              {["Understand producer & consumer roles", "Trace energy through a food chain", "Identify apex predators", "Explain what happens when a link breaks"].map(o => (
                <div key={o} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7 }}>
                  <span style={{ color: pr.color, fontWeight: 900, fontSize: 13, lineHeight: 1.5, flexShrink: 0 }}>→</span>
                  <span className="ns t-small" style={{ color: DS.inkSoft, lineHeight: 1.6 }}>{o}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="n t-label" style={{ color: pr.color, marginBottom: 7 }}>Playlist · 3/5</div>
              {PLAYLIST.map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${pr.tint}` }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, background: v.done ? "#E8F8F0" : v.active ? pr.tint : "#F8F5F0", border: `1.5px solid ${v.done ? "#4CAF8A" : v.active ? pr.color : "#C4BBAF"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
                    {v.done ? <span style={{ color: "#4CAF8A", fontWeight: 900 }}>✓</span> : v.active ? <span style={{ color: pr.color }}>▶</span> : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="n t-small" style={{ fontWeight: v.active ? 700 : 500, color: v.done ? DS.inkFade : DS.ink, textDecoration: v.done ? "line-through" : "none" }}>{v.title}</div>
                  </div>
                  <div className="n t-label" style={{ color: DS.inkFade }}>{v.duration}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHELL ────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(0);
  const Views = [Landing, Returning, Admin, KidsDash, Lesson];
  const V = Views[view];
  return (
    <div>
      <G />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: `${DS.card}F5`, backdropFilter: "blur(12px)", borderBottom: DS.border, display: "flex", gap: 4, padding: "8px 16px" }}>
        {tabs.map((t, i) => (
          <Shadow key={i} offset={view === i ? 2 : 0} size={1.5} radius={DS.radius.pill}>
            <button onClick={() => setView(i)} className="n"
              style={{ position: "relative", padding: "7px 18px", borderRadius: DS.radius.pill, border: view === i ? DS.border : "2.5px solid transparent", fontWeight: 800, fontSize: 13, cursor: "pointer", background: view === i ? DS.ink : "transparent", color: view === i ? "#FAF6F0" : DS.inkSoft, transition: "all .2s" }}>{t}</button>
          </Shadow>
        ))}
      </div>
      <div style={{ paddingTop: 52 }}><V /></div>
    </div>
  );
}
