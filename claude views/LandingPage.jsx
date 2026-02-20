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

const PROFILES = [
  { id:"amara",  name:"Amara",  year:"Year 1",  age:"5–6",   color:"#FF6B6B", tint:"#FFF0F0", emoji:"🦋", interests:["Animals","Drawing","Singing","Nature"]       },
  { id:"marcus", name:"Marcus", year:"Year 3",  age:"7–8",   color:"#4CAF8A", tint:"#EDFAF4", emoji:"🦖", interests:["Dinosaurs","Football","Building","Comics"]    },
  { id:"sophia", name:"Sophia", year:"Year 5",  age:"9–10",  color:"#9B6DD6", tint:"#F3EEFF", emoji:"🎨", interests:["Art","Dance","Music","Sports"]                },
  { id:"kai",    name:"Kai",    year:"Year 7",  age:"11–12", color:"#F5A623", tint:"#FFF8EC", emoji:"🛹", interests:["Gaming","Skateboarding","History","Film"]     },
  { id:"adrian", name:"Adrian", year:"Year 9",  age:"13–14", color:"#2B8ED4", tint:"#EAF4FC", emoji:"🏀", interests:["Design","Maths","Science","Basketball"]       },
  { id:"rohan",  name:"Rohan",  year:"Year 11", age:"15–16", color:"#E8507A", tint:"#FFF0F5", emoji:"📸", interests:["Coding","Photography","Film","Economics"]     },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { font-family: 'Nunito Sans', sans-serif; background: #FAF6F0; color: #1A1A2E; }
    .b  { font-family: 'Baloo 2', cursive; }
    .n  { font-family: 'Nunito', sans-serif; }
    .t-hero  { font-size: 56px; font-weight: 800; line-height: 1.0; }
    .t-h2    { font-size: 22px; font-weight: 800; line-height: 1.2; }
    .t-small { font-size: 12px; font-weight: 600; line-height: 1.5; }
    .t-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    .float { animation: float 3s ease-in-out infinite; }
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

const Tag = ({ label, color, dark = false }) => (
  <Shadow offset={2} size={2} radius={DS.radius.pill} style={{ display: "inline-block" }}>
    <div style={{ position: "relative", background: dark ? DS.ink : color, border: DS.border, borderRadius: DS.radius.pill, padding: "3px 13px" }}>
      <span className="n t-label" style={{ color: "#fff" }}>{label}</span>
    </div>
  </Shadow>
);

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [active, setActive] = useState(2);
  const p = PROFILES[active];

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
      <GlobalStyles />
      <Texture />
      <Deco color={p.color} />

      {/* NAV */}
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

      {/* HERO */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "44px 40px 8px" }}>
        <h1 className="b t-hero" style={{ color: DS.ink, marginBottom: 8 }}>Who's ready for an</h1>
        <Shadow offset={5} size={3} radius={DS.radius.md} style={{ display: "inline-block" }}>
          <div style={{ position: "relative", background: p.color, border: DS.border, borderRadius: DS.radius.md, padding: "4px 32px", marginBottom: 12, transition: "background .35s" }}>
            <span className="b" style={{ fontSize: 56, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>ADVENTURE?</span>
          </div>
        </Shadow>
        <p className="n" style={{ fontSize: 17, fontWeight: 700, color: DS.inkSoft, marginTop: 12, marginBottom: 32 }}>Pick your hero to start your learning mission!</p>
      </div>

      {/* CAROUSEL */}
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

      {/* CTA */}
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
