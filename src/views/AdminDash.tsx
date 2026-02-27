import React, { useState, useMemo, useEffect } from 'react';
import { DS } from '../components/design-system';
import { ChildProfile, TopicFrequency, Subject } from '../types';
import { getSubjectHexColor, getSubjectCategory, SUBJECT_BUCKET_ORDER } from '../utils/subjects';
import { getSubjectColor as getGlobalSubjectColor, getSubjectCategoryLabel } from '../constants';

import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { countCompletedToday, getCompletionRate, getTotalTimeHours, calculateStreak } from '../utils/dashboardStats';

interface AdminDashProps { }

// Removed local GlobalStyles - now in index.css

const BendayShadow = ({ offset = 3, size = 3 }: { offset?: number; size?: number }) => (
  <div style={{
    position: "absolute", top: offset, left: offset, right: -offset, bottom: -offset,
    zIndex: -1, pointerEvents: "none",
    backgroundImage: `radial-gradient(circle, ${DS.dotBrown} ${size}px, transparent ${size}px)`,
    backgroundSize: `${size * 2.2}px ${size * 2.2}px`,
    borderRadius: "inherit", opacity: 0.35,
  }} />
);

const Shadow: React.FC<{ children: React.ReactNode; offset?: number; size?: number; radius?: number; style?: React.CSSProperties }> = ({ children, offset = 3, size = 3, radius, style = {} }) => (
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

// Derive kids from data prop

export const AdminDash: React.FC<AdminDashProps> = () => {
  const { children, user } = useAppContext();
  const navigate = useNavigate();

  const onNavigate = (view: { type: 'LANDING' | 'KIDSDASH' | 'ADMIN' | 'HOME' | 'MARKETPLACE' | 'CURRICULUM' | 'PROFILES'; childId?: string }) => {
    if (view.type === 'KIDSDASH' && view.childId) navigate(`/kiddash?child=${view.childId}`);
    else if (view.type === 'ADMIN' || view.type === 'HOME') navigate('/admindash');
    else if (view.type === 'LANDING') navigate('/');
    else if (view.type === 'MARKETPLACE') navigate('/marketplace');
    else if (view.type === 'CURRICULUM') navigate('/curriculumbuilder');
    else if (view.type === 'PROFILES') navigate('/returningview');
  };

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('subjectColors');
    return saved ? JSON.parse(saved) : {};
  });

  // Frequency modes per child
  const [freqModes, setFreqModes] = useState<Record<string, Record<string, TopicFrequency>>>(() => {
    const saved = localStorage.getItem('child_freq_modes');
    return saved ? JSON.parse(saved) : {};
  });

  const [childFreqWeights, setChildFreqWeights] = useState<Record<string, 'balanced' | 'stem' | 'arts'>>(() => {
    const saved = localStorage.getItem('child_freq_weights');
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

  // Save to localStorage when state changes
  React.useEffect(() => {
    localStorage.setItem('child_freq_modes', JSON.stringify(freqModes));
    localStorage.setItem('child_freq_weights', JSON.stringify(childFreqWeights));
  }, [freqModes, childFreqWeights]);

  const kids = useMemo(() => {
    return children.map((child) => {
      // Map currency subjects to the dashboard format
      const subjects = (child.yearGroups[0]?.subjects || []).map(s => ({
        subject: s.name,
        topic: s.topics[0]?.name || 'No Topic',
        icon: '📚',
        color: getSubjectColor(s.name),
        progress: s.topics[0]?.lessons.filter(l => l.completed).length || 0,
        total: s.topics[0]?.lessons.length || 1,
        category: s.category || getSubjectCategory(s.name)
      }));

      // Mock schedule for now based on subjects
      const schedule = subjects.slice(0, 5).map((s, i) => ({
        subject: s.subject,
        topic: s.topic,
        icon: s.icon,
        status: i === 0 ? 'done' : i === 2 ? 'active' : 'upcoming'
      }));

      return {
        profile: {
          id: child.id,
          name: child.name,
          emoji: child.avatar,
          color: getGlobalSubjectColor(child.themeColor as any),
          year: child.yearGroups[0]?.name || 'N/A'
        },
        schedule: [
          ...schedule.slice(0, 2),
          { subject: "LUNCH", topic: "", icon: "🍽️", status: "lunch" },
          ...schedule.slice(2)
        ],
        subjects,
        done: countCompletedToday(child),
        total: subjects.reduce((sum, s) => sum + s.total, 0),
        streak: calculateStreak(child),
        totalHours: getTotalTimeHours(child)
      };
    });
  }, [children, subjectColors]);

  const cycleFreqMode = (kidIndex: number, subjectName: string) => {
    const kid = kids[kidIndex];
    if (!kid) return;

    const kidId = kid.profile.id;
    const frequencies: TopicFrequency[] = ['low', 'balanced', 'high'];
    const current = (freqModes[kidId] && freqModes[kidId][subjectName]) || 'balanced';
    const currentIndex = frequencies.indexOf(current);
    const next = frequencies[(currentIndex + 1) % frequencies.length];

    setFreqModes(prev => ({
      ...prev,
      [kidId]: { ...(prev[kidId] || {}), [subjectName]: next }
    }));
  };

  const cycleChildFreqMode = (kidIndex: number) => {
    const kid = kids[kidIndex];
    if (!kid) return;

    const kidId = kid.profile.id;
    const modes: ('balanced' | 'stem' | 'arts')[] = ['balanced', 'stem', 'arts'];
    const currentWeight = childFreqWeights[kidId] || 'balanced';
    const next = modes[(modes.indexOf(currentWeight) + 1) % modes.length];

    // Set the child-level mode
    setChildFreqWeights(prev => ({ ...prev, [kidId]: next }));

    // Update all subject cards based on category and weighting
    const subjects = kid.subjects;
    const newFreqModes: Record<string, TopicFrequency> = {};

    const isCoreSubject = (subj: string) => {
      const core = ['Maths', 'English', 'Science'];
      return core.includes(subj);
    };

    const isArtsSubject = (subj: any) => subj.category === 'arts';
    const isStemSubject = (subj: any) => subj.category === 'stem';

    subjects.forEach((subj: any) => {
      if (next === 'balanced') {
        newFreqModes[subj.subject] = 'balanced';
      } else if (next === 'stem') {
        newFreqModes[subj.subject] = isStemSubject(subj) ? 'high' : 'low';
      } else if (next === 'arts') {
        if (isCoreSubject(subj.subject)) {
          newFreqModes[subj.subject] = 'balanced';
        } else {
          newFreqModes[subj.subject] = isArtsSubject(subj) ? 'high' : 'low';
        }
      }
    });

    setFreqModes(prev => ({ ...prev, [kidId]: newFreqModes }));
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
        {kids.map((kid, ki) => (
          <div
            key={kid.profile.id}
            onClick={() => document.getElementById(`section-${kid.profile.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
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
            <span style={{ fontSize: 16 }}>{kid.profile.emoji}</span>
            {sidebarOpen && <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 600, whiteSpace: "nowrap" }}>{kid.profile.name}</span>}
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
          onClick={() => onNavigate({ type: 'CURRICULUM' })}
          style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderLeft: "4px solid transparent" }}
        >
          <span style={{ fontSize: 16 }}>📚</span>
          {sidebarOpen && <span className="n t-small" style={{ color: DS.inkSoft, fontWeight: 600, whiteSpace: "nowrap" }}>Curriculum Builder</span>}
        </div>

        {/* Marketplace */}
        <div
          onClick={() => onNavigate({ type: 'MARKETPLACE' })}
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
        <div onClick={() => onNavigate({ type: 'PROFILES' })} style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderTop: `2px solid #EDE8E0`, marginTop: 8 }}>
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
              <p className="n t-small" style={{ color: DS.inkSoft, marginTop: 3 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
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

        {/* KID SECTIONS */}
        {kids.map((kid, ki) => (
          <div key={kid.profile.id} id={`section-${kid.profile.id}`} style={{ marginTop: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Shadow offset={2} size={2} radius={DS.radius.sm}>
                <div style={{ position: "relative", background: kid.profile.color, border: DS.border, borderRadius: DS.radius.sm, padding: "4px 16px" }}>
                  <span className="b t-label" style={{ color: "#fff" }}>{kid.profile.name.toUpperCase()}'S SUBJECTS</span>
                </div>
              </Shadow>
              <div
                onClick={() => cycleChildFreqMode(ki)}
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
                {childFreqWeights[kid.profile.id] || 'balanced'}
              </div>
              <div style={{ flex: 1, height: 2, background: "rgba(26, 26, 46, 0.094)", borderRadius: 100 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {kid.subjects.sort((a, b) => SUBJECT_BUCKET_ORDER.indexOf(getSubjectCategory(a.subject)) - SUBJECT_BUCKET_ORDER.indexOf(getSubjectCategory(b.subject))).map((item, i) => (
                <div
                  key={i}
                  className={`card-${i}`}
                  style={{
                    position: "relative",
                    borderRadius: DS.radius.lg,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ position: "relative", borderRadius: DS.radius.lg, transition: "transform 0.15s ease" }}>
                    <div style={{ position: "absolute", top: 2, left: 2, right: -2, bottom: -2, zIndex: -1, pointerEvents: "none", backgroundImage: `radial-gradient(circle, ${DS.dotBrown} 3px, transparent 3px)`, backgroundSize: "6.6px 6.6px", borderRadius: "inherit", opacity: 0.35 }} />
                    <div
                      style={{
                        position: "relative",
                        background: DS.card,
                        border: "3px solid #C4BBAF",
                        borderRadius: DS.radius.lg,
                        padding: "16px 14px",
                        transition: "border-color 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ width: 40, height: 40, background: `${item.color}20`, border: `2px solid ${item.color}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{item.icon}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div
                            onClick={(e) => { e.stopPropagation(); cycleFreqMode(ki, item.subject); }}
                            style={{ cursor: "pointer", display: "flex", gap: 1 }}
                          >
                            {['low', 'balanced', 'high'].map((lvl) => {
                              const kidModes = freqModes[kid.profile.id] || {};
                              const current = kidModes[item.subject] || 'balanced';
                              const active = lvl === 'low' ||
                                (lvl === 'balanced' && (current === 'balanced' || current === 'high')) ||
                                (lvl === 'high' && current === 'high');
                              return (
                                <span
                                  key={lvl}
                                  style={{
                                    fontSize: 14,
                                    color: active ? "#F5A623" : "rgba(26, 26, 46, 0.1)"
                                  }}
                                >
                                  ★
                                </span>
                              );
                            })}
                          </div>
                          <Shadow offset={3} size={1} radius={DS.radius.pill}>
                            <div style={{ position: "relative", background: item.color, border: DS.border, borderRadius: DS.radius.pill, padding: "2px 8px" }}>
                              <span className="n t-label" style={{ color: "#fff" }}>{item.progress}/{item.total}</span>
                            </div>
                          </Shadow>
                        </div>
                      </div>
                      <div className="b t-h3" style={{ color: DS.ink, marginBottom: 2 }}>{item.subject}</div>
                      <div className="n t-label" style={{ color: DS.inkSoft, marginBottom: 6, fontWeight: 600 }}>{item.topic}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', background: `${item.color}15`, border: `1px solid ${item.color}40`, borderRadius: 4, marginBottom: 8 }}>
                        <span className="n" style={{ fontSize: 9, fontWeight: 700, color: item.color, textTransform: 'uppercase' }}>{getSubjectCategoryLabel(item.subject)}</span>
                      </div>
                      <div style={{ height: 7, background: "#EDE8E0", borderRadius: 100, overflow: "hidden", border: "1.5px solid #1A1A2E" }}>
                        <div style={{ height: "100%", width: `${(item.progress / item.total) * 100}%`, background: item.color, borderRadius: 100 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

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
                    <div className="b t-h2" style={{ color: DS.ink }}>{kids.length}</div>
                    <div className="n t-label" style={{ color: DS.inkSoft }}>Children</div>
                  </div>
                  <div style={{ padding: 16, background: "#4CAF8A15", borderRadius: DS.radius.sm, border: "1.5px solid #4CAF8A" }}>
                    <div className="b t-h2" style={{ color: DS.ink }}>{kids.reduce((acc, k) => acc + k.done, 0)}</div>
                    <div className="n t-label" style={{ color: DS.inkSoft }}>Lessons Today</div>
                  </div>
                  <div style={{ padding: 16, background: "#9B6DD615", borderRadius: DS.radius.sm, border: "1.5px solid #9B6DD6" }}>
                    <div className="b t-h2" style={{ color: DS.ink }}>{kids.length > 0 ? Math.max(...kids.map(k => k.streak)) : 0}</div>
                    <div className="n t-label" style={{ color: DS.inkSoft }}>Day Streak</div>
                  </div>
                </div>
                <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                  <button
                    onClick={() => onNavigate({ type: 'CURRICULUM' })}
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
                    onClick={() => onNavigate({ type: 'PROFILES' })}
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
                    { day: 'Mon', childData: kids.map(k => Math.floor(Math.random() * 5)) },
                    { day: 'Tue', childData: kids.map(k => Math.floor(Math.random() * 5)) },
                    { day: 'Wed', childData: kids.map(k => Math.floor(Math.random() * 5)) },
                    { day: 'Thu', childData: kids.map(k => Math.floor(Math.random() * 5)) },
                    { day: 'Fri', childData: kids.map(k => Math.floor(Math.random() * 5)) },
                  ].map((d, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 100 }}>
                        {d.childData.map((val, ki) => (
                          <div key={ki} style={{ width: 16, background: kids[ki].profile.color, borderRadius: "4px 4px 0 0", height: val * 20, transition: "height 0.3s" }} />
                        ))}
                      </div>
                      <span className="n t-label" style={{ color: DS.inkFade }}>{d.day}</span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid #EDE8E0", flexWrap: "wrap" }}>
                  {kids.map((kid, ki) => (
                    <div key={ki} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, background: kid.profile.color, borderRadius: 2 }} />
                      <span className="n t-small" style={{ color: DS.inkSoft }}>{kid.profile.name}</span>
                    </div>
                  ))}
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
                  <span className="b" style={{ fontSize: 28, color: DS.ink }}>{
                    Math.round((kids.reduce((acc, k) => acc + k.done, 0) / Math.max(1, kids.reduce((acc, k) => acc + k.total, 0))) * 100)
                  }%</span>
                </div>
                <div className="b t-h2" style={{ color: DS.ink }}>Completion Rate</div>
                <div className="n t-label" style={{ color: DS.inkFade, marginTop: 4 }}>This Week</div>
              </div>
            </Shadow>

            {/* TOTAL TIME */}
            <Shadow offset={3} size={2.5} radius={DS.radius.lg}>
              <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 26, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>⏱️</div>
                <div className="b t-h2" style={{ color: DS.ink }}>
                  {kids.reduce((acc, k) => acc + parseFloat(k.totalHours), 0).toFixed(1)} hrs
                </div>
                <div className="n t-label" style={{ color: DS.inkFade, marginTop: 4 }}>Total Learning Time</div>
                <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                  {kids.map((kid, ki) => (
                    <div key={ki}>
                      <div className="b" style={{ color: kid.profile.color, fontSize: 18 }}>{kid.totalHours}h</div>
                      <div className="n t-label" style={{ color: DS.inkFade }}>{kid.profile.name}</div>
                    </div>
                  ))}
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
