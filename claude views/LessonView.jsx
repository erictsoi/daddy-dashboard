import { useState, useEffect } from "react";

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

const PLAYLIST = [
  { title:"What is an Ecosystem?",              duration:"7:20",  done:true          },
  { title:"Producers, Consumers & Decomposers", duration:"9:15",  done:true          },
  { title:"Food Chains Explained",              duration:"11:40", done:false, active:true },
  { title:"Food Webs & Energy Flow",            duration:"8:30",  done:false         },
  { title:"Ecosystems Under Threat",            duration:"12:10", done:false         },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { font-family: 'Nunito Sans', sans-serif; background: #FAF6F0; color: #1A1A2E; }
    .b  { font-family: 'Baloo 2', cursive; }
    .n  { font-family: 'Nunito', sans-serif; }
    .ns { font-family: 'Nunito Sans', sans-serif; }
    .t-h2    { font-size: 22px; font-weight: 800; line-height: 1.2; }
    .t-body  { font-size: 14px; font-weight: 500; line-height: 1.65; }
    .t-small { font-size: 12px; font-weight: 600; line-height: 1.5; }
    .t-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    @keyframes pop { from{transform:scale(.88);opacity:0} to{transform:scale(1);opacity:1} }
    @keyframes slide { from{transform:translateX(24px);opacity:0} to{transform:translateX(0);opacity:1} }
    .pop { animation: pop .3s cubic-bezier(.34,1.56,.64,1) forwards; }
    .slide { animation: slide .28s ease-out forwards; }
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

// ─── LESSON VIEW ──────────────────────────────────────────────────────────────
export default function LessonView() {
  const pr = PROFILE;
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
      <GlobalStyles />
      <Texture />
      <Blobs color={pr.color} />

      {/* TOP BAR */}
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

      {/* BODY */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16, overflow: "auto" }}>
          {/* VIDEO */}
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

          {/* MARK COMPLETE */}
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

        {/* INFO PANEL */}
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
