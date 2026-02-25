import React, { useState } from 'react';
import { getDummyProfiles } from '../src/data/dummyData';
import { getSubjectColor } from '../constants';
import { getSubjectHexColor } from '../utils/subjects';

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
    .subject-card { transition: transform 0.15s ease; }
    .subject-card:hover { transform: translate(-2px, -2px) !important; }
    .subject-card-inner { transition: border-color 0.15s; }
    .subject-card:hover .subject-card-inner { border-color: #1A1A2E !important; }
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
    { subject: "Art", topic: "Watercolour", icon: "🎨", status: "stretch" },
  ],
  adrian: [
    { subject: "Maths", topic: "Algebra II", icon: "📐", status: "done" },
    { subject: "Science", topic: "Chemical Reactions", icon: "🔬", status: "done" },
    { subject: "LUNCH", topic: "", icon: "🍽️", status: "lunch" },
    { subject: "English", topic: "Essay Writing", icon: "📖", status: "active" },
    { subject: "Design", topic: "Graphic Design", icon: "✏️", status: "stretch" },
  ],
};

const SUBJECTS: Record<string, any[]> = {
  sophia: [
    { subject: "Maths", topic: "Fractions", icon: "📐", color: getSubjectColor("Maths"), progress: 1, total: 1, category: "stem" },
    { subject: "English", topic: "Creative Writing", icon: "📖", color: getSubjectColor("English"), progress: 1, total: 1, category: "arts" },
    { subject: "Science", topic: "Ecosystems", icon: "🔬", color: getSubjectColor("Science"), progress: 0, total: 1, category: "stem" },
    { subject: "Art", topic: "Watercolour", icon: "🎨", color: getSubjectColor("Art"), progress: 0, total: 1, category: "arts" },
    { subject: "Music", topic: "Rhythm & Beat", icon: "🎵", color: getSubjectColor("Music"), progress: 0, total: 1, category: "arts" },
    { subject: "PE", topic: "Gymnastics", icon: "⚽", color: getSubjectColor("PE"), progress: 0, total: 1, category: "arts" },
    { subject: "History", topic: "Ancient Egypt", icon: "📜", color: getSubjectColor("History"), progress: 0, total: 1, category: "arts" },
    { subject: "Geography", topic: "Weather Systems", icon: "🌍", color: getSubjectColor("Geography"), progress: 0, total: 1, category: "arts" },
    { subject: "Drama", topic: "Improvisation", icon: "🎭", color: getSubjectColor("Drama"), progress: 0, total: 1, category: "arts" },
    { subject: "Technology", topic: "Intro to Coding", icon: "✏️", color: getSubjectColor("Technology"), progress: 0, total: 1, category: "stem" },
    { subject: "Languages", topic: "French Basics", icon: "🗣️", color: getSubjectColor("Languages"), progress: 0, total: 1, category: "arts" },
    { subject: "PSHE", topic: "Wellbeing", icon: "💛", color: getSubjectColor("PSHE"), progress: 0, total: 1, category: "arts" },
  ],
  adrian: [
    { subject: "Maths", topic: "Algebra II", icon: "📐", color: getSubjectColor("Maths"), progress: 1, total: 1, category: "stem" },
    { subject: "Science", topic: "Chemical Reactions", icon: "🔬", color: getSubjectColor("Science"), progress: 1, total: 1, category: "stem" },
    { subject: "English", topic: "Essay Writing", icon: "📖", color: getSubjectColor("English"), progress: 0, total: 1, category: "arts" },
    { subject: "Design", topic: "Graphic Design", icon: "✏️", color: getSubjectColor("Design"), progress: 0, total: 1, category: "stem" },
    { subject: "Physics", topic: "Mechanics", icon: "⚡", color: getSubjectColor("Physics"), progress: 0, total: 1, category: "stem" },
    { subject: "History", topic: "World Wars", icon: "📜", color: getSubjectColor("History"), progress: 0, total: 1, category: "arts" },
    { subject: "Geography", topic: "Climate Change", icon: "🌍", color: getSubjectColor("Geography"), progress: 0, total: 1, category: "arts" },
    { subject: "Computer Science", topic: "Python Programming", icon: "💻", color: getSubjectColor("Computer Science"), progress: 0, total: 1, category: "stem" },
    { subject: "Art", topic: "Digital Art", icon: "🎨", color: getSubjectColor("Art"), progress: 0, total: 1, category: "arts" },
    { subject: "Music", topic: "Music Theory", icon: "🎵", color: getSubjectColor("Music"), progress: 0, total: 1, category: "arts" },
    { subject: "PE", topic: "Basketball", icon: "🏀", color: getSubjectColor("PE"), progress: 0, total: 1, category: "arts" },
    { subject: "Languages", topic: "Spanish Basics", icon: "🗣️", color: getSubjectColor("Languages"), progress: 0, total: 1, category: "arts" },
  ],
};

export const AdminDash: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [hoveredSophia, setHoveredSophia] = React.useState<number | null>(null);
  const [hoveredAdrian, setHoveredAdrian] = React.useState<number | null>(null);
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('subjectColors');
    return saved ? JSON.parse(saved) : { };
  });
  const [freqModeSophia, setFreqModeSophia] = React.useState<Record<string, 1 | 2 | 3>>(() => {
    const saved = localStorage.getItem('freqModeSophia');
    return saved ? JSON.parse(saved) : {};
  });
  const [freqModeAdrian, setFreqModeAdrian] = React.useState<Record<string, 1 | 2 | 3>>(() => {
    const saved = localStorage.getItem('freqModeAdrian');
    return saved ? JSON.parse(saved) : {};
  });

  const handleColorChange = (subject: string, color: string) => {
    const updated = { ...subjectColors, [subject]: color };
    setSubjectColors(updated);
    localStorage.setItem('subjectColors', JSON.stringify(updated));
  };

  const getSubjectColor = (subject: string): string => {
    return subjectColors[subject] || getSubjectHexColor(subject);
  };
  const [childFreqMode, setChildFreqMode] = React.useState<[('balanced' | 'stem' | 'arts'), ('balanced' | 'stem' | 'arts')]>(() => {
    const saved = localStorage.getItem('childFreqMode');
    return saved ? JSON.parse(saved) : ['balanced', 'balanced'];
  });

  // Save to localStorage when state changes
  React.useEffect(() => {
    localStorage.setItem('freqModeSophia', JSON.stringify(freqModeSophia));
    localStorage.setItem('freqModeAdrian', JSON.stringify(freqModeAdrian));
    localStorage.setItem('childFreqMode', JSON.stringify(childFreqMode));
  }, [freqModeSophia, freqModeAdrian, childFreqMode]);

  const kids = [PROFILES[2], PROFILES[4]].map((profile, i) => ({
    profile,
    schedule: SCHEDULES[profile.id] || SCHEDULES.sophia,
    subjects: SUBJECTS[profile.id] || SUBJECTS.sophia,
    done: 2,
    total: 4,
    streak: i === 0 ? 5 : 8,
  }));

  const cycleFreqMode = (kidIndex: number, subjectName: string) => {
    const current = kidIndex === 0 ? freqModeSophia[subjectName] : freqModeAdrian[subjectName];
    const next = ((current || 2) % 3) + 1 as 1 | 2 | 3;
    if (kidIndex === 0) {
      setFreqModeSophia(prev => ({ ...prev, [subjectName]: next }));
    } else {
      setFreqModeAdrian(prev => ({ ...prev, [subjectName]: next }));
    }
  };

  const cycleChildFreqMode = (kidIndex: number) => {
    const modes: ('balanced' | 'stem' | 'arts')[] = ['balanced', 'stem', 'arts'];
    const next = modes[(modes.indexOf(childFreqMode[kidIndex]) + 1) % modes.length];
    
    // Set the child-level mode
    setChildFreqMode(prev => {
      const newArr = [...prev] as typeof prev;
      newArr[kidIndex] = next;
      return newArr;
    });

    // Update all subject cards based on category and weighting
    const subjects = kidIndex === 0 ? kids[0].subjects : kids[1].subjects;
    const newFreqModes: Record<string, 1 | 2 | 3> = {};
    
    const isCoreSubject = (subj: string) => {
      const core = ['Maths', 'English', 'Science'];
      return core.includes(subj);
    };
    
    const isArtsSubject = (subj: any) => subj.category === 'arts';
    const isStemSubject = (subj: any) => subj.category === 'stem';
    
    subjects.forEach((subj: any) => {
      if (next === 'balanced') {
        newFreqModes[subj.subject] = 2;
      } else if (next === 'stem') {
        // STEM: stem subjects get 3 stars, arts get 1 star
        if (isStemSubject(subj)) {
          newFreqModes[subj.subject] = 3;
        } else {
          newFreqModes[subj.subject] = 1;
        }
      } else if (next === 'arts') {
        // Arts: Core (Maths/English/Science) at 2 stars, arts subjects at 3, STEM at 1
        if (isCoreSubject(subj.subject)) {
          newFreqModes[subj.subject] = 2;
        } else if (isArtsSubject(subj)) {
          newFreqModes[subj.subject] = 3;
        } else {
          newFreqModes[subj.subject] = 1;
        }
      }
    });

    if (kidIndex === 0) {
      setFreqModeSophia(newFreqModes as any);
    } else {
      setFreqModeAdrian(newFreqModes as any);
    }
  };

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
        <div 
          onClick={() => document.getElementById('section-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "#F0EBE3", borderLeft: "4px solid #F5A623", transition: "all .2s" }}
        >
          <span style={{ fontSize: 16 }}>📊</span>
          {sidebarOpen && <span className="n t-small" style={{ color: DS.ink, fontWeight: 800, whiteSpace: "nowrap" }}>Overview</span>}
        </div>

        {/* Kids links */}
        {[
          { profile: PROFILES[2], section: 'section-sophia' },
          { profile: PROFILES[4], section: 'section-adrian' },
        ].map(({ profile, section }) => (
          <div 
            key={profile.id} 
            onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
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

        {/* Reports */}
        <div 
          onClick={() => document.getElementById('section-reports')?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
          style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderLeft: "4px solid transparent" }}
        >
          <span style={{ fontSize: 16 }}>📈</span>
          {sidebarOpen && <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 600, whiteSpace: "nowrap" }}>Reports</span>}
        </div>

        {/* Curriculum Builder */}
        <div 
          onClick={() => window.location.href = '/curriculum'}
          style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderLeft: "4px solid transparent" }}
        >
          <span style={{ fontSize: 16 }}>📚</span>
          {sidebarOpen && <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 600, whiteSpace: "nowrap" }}>Curriculum Builder</span>}
        </div>

        {/* Marketplace */}
        <div 
          onClick={() => window.location.href = '/marketplace'}
          style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderLeft: "4px solid transparent" }}
        >
          <span style={{ fontSize: 16 }}>🛒</span>
          {sidebarOpen && <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 600, whiteSpace: "nowrap" }}>Marketplace</span>}
        </div>

        <div 
          onClick={() => document.getElementById('section-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderLeft: "4px solid transparent" }}
        >
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
        
        {/* OVERVIEW SECTION */}
        <div id="section-overview">
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

        {/* KIDS SCHEDULES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          {kids.map(({ profile: pr, schedule, done, total, streak }, ki) => (
            <Shadow key={pr.id} offset={3} size={2.5} radius={DS.radius.lg} style={{ animation: `fadeUp .32s ${ki * .08}s ease-out both` }}>
              <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <Shadow offset={2} size={1.5} radius={13}>
                    <div style={{ position: "relative", width: 46, height: 46, borderRadius: 13, background: `${pr.color}20`, border: DS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{pr.emoji}</div>
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
                  {schedule.map((item: any, i: number) =>
                    item.status === "lunch"
                      ? <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                          <div style={{ flex: 1, height: 1, background: "#EDE8F0" }} />
                          <span className="n t-label" style={{ color: DS.inkFade }}>LUNCH 12–1PM</span>
                          <div style={{ flex: 1, height: 1, background: "#EDE8F0" }} />
                        </div>
                      : <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: DS.radius.sm, background: item.status === "active" ? `${pr.color}15` : "transparent", border: item.status === "active" ? `1.5px solid ${pr.color}` : "1.5px solid transparent" }}>
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

        {/* SOPHIA SECTION */}
        <div id="section-sophia" style={{ marginTop: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Shadow offset={2} size={2} radius={DS.radius.sm}>
              <div style={{ position: "relative", background: kids[0].profile.color, border: DS.border, borderRadius: DS.radius.sm, padding: "4px 16px" }}>
                <span className="b t-label" style={{ color: "#fff" }}>{kids[0].profile.name.toUpperCase()}'S SUBJECTS</span>
              </div>
            </Shadow>
            <div 
              onClick={() => cycleChildFreqMode(0)}
              style={{ 
                cursor: "pointer", 
                padding: "4px 12px", 
                background: "#EDE8E0", 
                border: "1.5px solid #1A1A2E", 
                borderRadius: DS.radius.sm,
                fontSize: 10,
                fontWeight: 700,
                color: DS.ink,
                textTransform: "uppercase"
              }}
            >
              {childFreqMode[0]}
            </div>
            <div style={{ flex: 1, height: 2, background: "rgba(26, 26, 46, 0.094)", borderRadius: 100 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {kids[0].subjects.map((item: any, i: number) => (
                <div 
                  key={i}
                  className={`card-${i}`}
                  onMouseEnter={() => setHoveredSophia(i)}
                  onMouseLeave={() => setHoveredSophia(null)}
                  style={{ 
                    position: "relative", 
                    borderRadius: DS.radius.lg, 
                    cursor: "pointer"
                  }}
                >
                  <div style={{ position: "relative", borderRadius: DS.radius.lg, transform: hoveredSophia === i ? "translate(-2px, -2px)" : "none", transition: "transform 0.15s ease" }}>
                    <div style={{ position: "absolute", top: 2, left: 2, right: -2, bottom: -2, zIndex: -1, pointerEvents: "none", backgroundImage: `radial-gradient(circle, ${DS.dotBrown} 2px, transparent 2px)`, backgroundSize: "4.4px 4.4px", borderRadius: "inherit", opacity: 0.35 }} />
                    <div 
                      style={{ 
                        position: "relative", 
                        background: DS.card, 
                        border: hoveredSophia === i ? `3px solid ${DS.ink}` : "3px solid #C4BBAF", 
                        borderRadius: DS.radius.lg, 
                        padding: "16px 14px",
                        transition: "border-color 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ width: 40, height: 40, background: `${item.color}20`, border: `2px solid ${item.color}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{item.icon}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div 
                            onClick={(e) => { e.stopPropagation(); cycleFreqMode(0, item.subject); }}
                            style={{ cursor: "pointer", display: "flex", gap: 1 }}
                          >
                            {[1, 2, 3].map((star) => (
                              <span 
                                key={star}
                                style={{ 
                                  fontSize: 14, 
                                  color: star >= (4 - (freqModeSophia[item.subject] || 2)) ? "#F5A623" : "transparent" 
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <Shadow offset={3} size={1} radius={DS.radius.pill}>
                            <div style={{ position: "relative", background: item.color, border: DS.border, borderRadius: DS.radius.pill, padding: "2px 8px" }}>
                              <span className="n t-label" style={{ color: "#fff" }}>{item.progress}/{item.total}</span>
                            </div>
                          </Shadow>
                        </div>
                      </div>
                      <div className="b t-h3" style={{ color: DS.ink, marginBottom: 2 }}>{item.subject}</div>
                      <div className="n t-label" style={{ color: DS.inkSoft, marginBottom: 10, fontWeight: 600 }}>{item.topic}</div>
                      <div style={{ height: 7, background: "#EDE8E0", borderRadius: 100, overflow: "hidden", border: "1.5px solid #1A1A2E" }}>
                        <div style={{ height: "100%", width: `${(item.progress / item.total) * 100}%`, background: item.color, borderRadius: 100 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* ADRIAN SECTION */}
        <div id="section-adrian" style={{ marginTop: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Shadow offset={2} size={2} radius={DS.radius.sm}>
              <div style={{ position: "relative", background: kids[1].profile.color, border: DS.border, borderRadius: DS.radius.sm, padding: "4px 16px" }}>
                <span className="b t-label" style={{ color: "#fff" }}>{kids[1].profile.name.toUpperCase()}'S SUBJECTS</span>
              </div>
            </Shadow>
            <div 
              onClick={() => cycleChildFreqMode(1)}
              style={{ 
                cursor: "pointer", 
                padding: "4px 12px", 
                background: "#EDE8E0", 
                border: "1.5px solid #1A1A2E", 
                borderRadius: DS.radius.sm,
                fontSize: 10,
                fontWeight: 700,
                color: DS.ink,
                textTransform: "uppercase"
              }}
            >
              {childFreqMode[1]}
            </div>
            <div style={{ flex: 1, height: 2, background: "rgba(26, 26, 46, 0.094)", borderRadius: 100 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {kids[1].subjects.map((item: any, i: number) => (
                <div 
                  key={i}
                  className={`card-${i}`}
                  onMouseEnter={() => setHoveredAdrian(i)}
                  onMouseLeave={() => setHoveredAdrian(null)}
                  style={{ 
                    position: "relative", 
                    borderRadius: DS.radius.lg, 
                    cursor: "pointer"
                  }}
                >
                  <div style={{ position: "relative", borderRadius: DS.radius.lg, transform: hoveredAdrian === i ? "translate(-2px, -2px)" : "none", transition: "transform 0.15s ease" }}>
                    <div style={{ position: "absolute", top: 2, left: 2, right: -2, bottom: -2, zIndex: -1, pointerEvents: "none", backgroundImage: `radial-gradient(circle, ${DS.dotBrown} 2px, transparent 2px)`, backgroundSize: "4.4px 4.4px", borderRadius: "inherit", opacity: 0.35 }} />
                    <div 
                      style={{ 
                        position: "relative", 
                        background: DS.card, 
                        border: hoveredAdrian === i ? `3px solid ${DS.ink}` : "3px solid #C4BBAF", 
                        borderRadius: DS.radius.lg, 
                        padding: "16px 14px",
                        transition: "border-color 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ width: 40, height: 40, background: `${item.color}20`, border: `2px solid ${item.color}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{item.icon}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div 
                            onClick={(e) => { e.stopPropagation(); cycleFreqMode(1, item.subject); }}
                            style={{ cursor: "pointer", display: "flex", gap: 1 }}
                          >
                            {[1, 2, 3].map((star) => (
                              <span 
                                key={star}
                                style={{ 
                                  fontSize: 14, 
                                  color: star >= (4 - (freqModeAdrian[item.subject] || 2)) ? "#F5A623" : "transparent" 
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <Shadow offset={3} size={1} radius={DS.radius.pill}>
                            <div style={{ position: "relative", background: item.color, border: DS.border, borderRadius: DS.radius.pill, padding: "2px 8px" }}>
                              <span className="n t-label" style={{ color: "#fff" }}>{item.progress}/{item.total}</span>
                            </div>
                          </Shadow>
                        </div>
                      </div>
                      <div className="b t-h3" style={{ color: DS.ink, marginBottom: 2 }}>{item.subject}</div>
                      <div className="n t-label" style={{ color: DS.inkSoft, marginBottom: 10, fontWeight: 600 }}>{item.topic}</div>
                      <div style={{ height: 7, background: "#EDE8E0", borderRadius: 100, overflow: "hidden", border: "1.5px solid #1A1A2E" }}>
                        <div style={{ height: "100%", width: `${(item.progress / item.total) * 100}%`, background: item.color, borderRadius: 100 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* ADMIN SECTION */}
        <div id="section-admin" style={{ marginTop: 48 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22 }}>
            <Shadow offset={3} size={2.5} radius={DS.radius.lg}>
              <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <Shadow offset={2} size={1.5} radius={13}>
                    <div style={{ position: "relative", width: 46, height: 46, borderRadius: 13, background: "#F5A62320", border: DS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👨</div>
                  </Shadow>
                  <div style={{ flex: 1 }}>
                    <div className="b t-h2" style={{ color: DS.ink }}>Daddy</div>
                    <div className="n t-label" style={{ color: "#F5A623" }}>Administrator</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  <div style={{ padding: 16, background: "#F5A62315", borderRadius: DS.radius.sm, border: "1.5px solid #F5A623" }}>
                    <div className="b t-h2" style={{ color: DS.ink }}>2</div>
                    <div className="n t-label" style={{ color: DS.inkSoft }}>Children</div>
                  </div>
                  <div style={{ padding: 16, background: "#4CAF8A15", borderRadius: DS.radius.sm, border: "1.5px solid #4CAF8A" }}>
                    <div className="b t-h2" style={{ color: DS.ink }}>4</div>
                    <div className="n t-label" style={{ color: DS.inkSoft }}>Lessons Today</div>
                  </div>
                  <div style={{ padding: 16, background: "#9B6DD615", borderRadius: DS.radius.sm, border: "1.5px solid #9B6DD6" }}>
                    <div className="b t-h2" style={{ color: DS.ink }}>13</div>
                    <div className="n t-label" style={{ color: DS.inkSoft }}>Day Streak</div>
                  </div>
                </div>
                <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                  <button 
                    onClick={() => window.location.href = '/curriculum'}
                    style={{ 
                      padding: "10px 20px", 
                      borderRadius: DS.radius.md, 
                      border: DS.border, 
                      background: DS.ink, 
                      color: "#fff", 
                      fontWeight: 700, 
                      cursor: "pointer",
                      fontSize: 13
                    }}
                  >
                    Curriculum Builder
                  </button>
                  <button 
                    onClick={() => window.location.href = '/returningview'}
                    style={{ 
                      padding: "10px 20px", 
                      borderRadius: DS.radius.md, 
                      border: DS.border, 
                      background: DS.card, 
                      color: DS.ink, 
                      fontWeight: 700, 
                      cursor: "pointer",
                      fontSize: 13
                    }}
                  >
                    Manage Profiles
                  </button>
                </div>
              </div>
            </Shadow>
          </div>
        </div>

        {/* REPORTS SECTION */}
        <div id="section-reports" style={{ marginTop: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Shadow offset={2} size={2} radius={DS.radius.sm}>
              <div style={{ position: "relative", background: "#9B6DD6", border: DS.border, borderRadius: DS.radius.sm, padding: "4px 16px" }}>
                <span className="b t-label" style={{ color: "#fff" }}>REPORTS</span>
              </div>
            </Shadow>
            <div style={{ flex: 1, height: 2, background: "rgba(26, 26, 46, 0.094)", borderRadius: 100 }} />
          </div>

          {/* CHARTS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            
            {/* WEEKLY PROGRESS CHART */}
            <Shadow offset={3} size={2.5} radius={DS.radius.lg}>
              <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26 }}>
                <div className="b t-h2" style={{ color: DS.ink, marginBottom: 20 }}>Weekly Progress</div>
                
                {/* Chart bars */}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 140, padding: "0 10px" }}>
                  {[
                    { day: 'Mon', sophia: 4, adrian: 3 },
                    { day: 'Tue', sophia: 3, adrian: 4 },
                    { day: 'Wed', sophia: 5, adrian: 2 },
                    { day: 'Thu', sophia: 2, adrian: 5 },
                    { day: 'Fri', sophia: 4, adrian: 4 },
                  ].map((d, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 100 }}>
                        <div style={{ width: 24, background: kids[0].profile.color, borderRadius: "4px 4px 0 0", height: d.sophia * 20, transition: "height 0.3s" }} />
                        <div style={{ width: 24, background: kids[1].profile.color, borderRadius: "4px 4px 0 0", height: d.adrian * 20, transition: "height 0.3s" }} />
                      </div>
                      <span className="n t-label" style={{ color: DS.inkFade }}>{d.day}</span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid #EDE8E0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 12, height: 12, background: kids[0].profile.color, borderRadius: 2 }} />
                    <span className="n t-small" style={{ color: DS.inkSoft }}>{kids[0].profile.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 12, height: 12, background: kids[1].profile.color, borderRadius: 2 }} />
                    <span className="n t-small" style={{ color: DS.inkSoft }}>{kids[1].profile.name}</span>
                  </div>
                </div>
              </div>
            </Shadow>

            {/* SUBJECT BREAKDOWN */}
            <Shadow offset={3} size={2.5} radius={DS.radius.lg}>
                <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26 }}>
                <div className="b t-h2" style={{ color: DS.ink, marginBottom: 20 }}>Subject Breakdown</div>
                
                {/* Bar chart */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { subject: "Maths", percent: 85 },
                    { subject: "English", percent: 72 },
                    { subject: "Science", percent: 60 },
                    { subject: "History", percent: 45 },
                    { subject: "Art", percent: 38 },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span className="n t-small" style={{ color: DS.ink, fontWeight: 600 }}>{item.subject}</span>
                        <span className="n t-small" style={{ color: DS.inkFade }}>{item.percent}%</span>
                      </div>
                      <div style={{ height: 8, background: "#EDE8E0", borderRadius: 4, overflow: "hidden", border: "1px solid #1A1A2E" }}>
                        <div style={{ height: "100%", width: `${item.percent}%`, background: getSubjectColor(item.subject), borderRadius: 4, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Shadow>
          </div>

          {/* STATS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22, marginTop: 22 }}>
            
            {/* COMPLETION RATE */}
            <Shadow offset={3} size={2.5} radius={DS.radius.lg}>
              <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26, textAlign: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", border: `6px solid #4CAF8A`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="b" style={{ fontSize: 28, color: DS.ink }}>78%</span>
                </div>
                <div className="b t-h2" style={{ color: DS.ink }}>Completion Rate</div>
                <div className="n t-label" style={{ color: DS.inkFade, marginTop: 4 }}>This Week</div>
              </div>
            </Shadow>

            {/* TOTAL TIME */}
            <Shadow offset={3} size={2.5} radius={DS.radius.lg}>
              <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>⏱️</div>
                <div className="b t-h2" style={{ color: DS.ink }}>12.5 hrs</div>
                <div className="n t-label" style={{ color: DS.inkFade, marginTop: 4 }}>Total Learning Time</div>
                <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 20 }}>
                  <div>
                    <div className="b" style={{ color: kids[0].profile.color, fontSize: 18 }}>6.2h</div>
                    <div className="n t-label" style={{ color: DS.inkFade }}>{kids[0].profile.name}</div>
                  </div>
                  <div>
                    <div className="b" style={{ color: kids[1].profile.color, fontSize: 18 }}>6.3h</div>
                    <div className="n t-label" style={{ color: DS.inkFade }}>{kids[1].profile.name}</div>
                  </div>
                </div>
              </div>
            </Shadow>

            {/* STREAKS */}
            <Shadow offset={3} size={2.5} radius={DS.radius.lg}>
              <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26 }}>
                <div className="b t-h2" style={{ color: DS.ink, marginBottom: 16 }}>Streaks</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {kids.map((kid, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 24 }}>🔥</div>
                      <div style={{ flex: 1 }}>
                        <div className="n t-small" style={{ color: DS.ink, fontWeight: 700 }}>{kid.profile.name}</div>
                        <div className="n t-label" style={{ color: DS.inkFade }}>{kid.streak} days</div>
                      </div>
                      <div style={{ 
                        padding: "4px 12px", 
                        background: `${kid.profile.color}20`, 
                        borderRadius: 100, 
                        border: `1.5px solid ${kid.profile.color}` 
                      }}>
                        <span className="n t-label" style={{ color: kid.profile.color }}>{kid.streak * 10} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Shadow>
          </div>
        </div>

        {/* SETTINGS SECTION */}
        <div id="section-settings" style={{ marginTop: 48, paddingTop: 28, borderTop: `2px solid ${DS.dotBrown}20` }}>
          <h1 className="b t-h1" style={{ color: DS.ink, marginBottom: 8 }}>Settings</h1>
          <p className="n t-small" style={{ color: DS.inkSoft, marginBottom: 24 }}>Customize your dashboard preferences</p>
          
          {/* Subject Colors */}
          <Shadow offset={3} size={2.5} radius={DS.radius.lg}>
            <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26 }}>
              <div className="b t-h2" style={{ color: DS.ink, marginBottom: 20 }}>Subject Colors</div>
              <p className="n t-small" style={{ color: DS.inkSoft, marginBottom: 20 }}>Assign colors to subjects - these will be consistent across all kids</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {Object.keys(subjectColors).map((subject) => (
                  <div key={subject} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: `${subjectColors[subject]}10`, borderRadius: DS.radius.md, border: `1.5px solid ${subjectColors[subject]}` }}>
                    <input
                      type="color"
                      value={subjectColors[subject]}
                      onChange={(e) => handleColorChange(subject, e.target.value)}
                      style={{ width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }}
                    />
                    <span className="n t-small" style={{ color: DS.ink, fontWeight: 600 }}>{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          </Shadow>
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
