import React, { useState, useEffect } from 'react';
import { ChildProfile, ViewOrigin } from '../types';
import { useAuth } from '../src/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DS, Shadow, getThemeColor } from '../components/design-system';
import { getDummyProfiles } from '../src/data/dummyData';

interface ReturningViewProps {
  childProfile: ChildProfile | null;
  data: ChildProfile[];
  onNavigate: (view: { type: 'LANDING' } | { type: 'KIDSDASH'; childId: string } | { type: 'ADMIN' }) => void;
}

export const ReturningView: React.FC<ReturningViewProps> = ({ childProfile, data, onNavigate }) => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth() || {};
  const [activeIndex, setActiveIndex] = useState(0);

  const DEMO_PROFILES = getDummyProfiles();

  const PROFILES = [
    { id: "admin", name: "Daddy", year: "Admin", age: "", color: "#1A1A2E", tint: "#E8E8E8", emoji: "👨", interests: ["Dashboard", "Settings"], isAdmin: true },
    ...DEMO_PROFILES.map(child => ({
      id: child.id,
      name: child.name,
      year: child.year,
      age: child.age,
      color: child.color,
      tint: child.tint,
      emoji: child.emoji,
      interests: child.interests,
      isAdmin: false,
    })),
  ];

  const total = PROFILES.length;
  const p = PROFILES[activeIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex(a => (a - 1 + total) % total);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex(a => (a + 1) % total);
      } else if (e.key === 'Enter') {
        const profile = PROFILES[activeIndex];
        if (profile) {
          if (profile.isAdmin) {
            onNavigate({ type: 'ADMIN' });
          } else {
            onNavigate({ type: 'KIDSDASH', childId: profile.id });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total, activeIndex, onNavigate]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: DS.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="b" style={{ color: DS.ink, fontSize: 24 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", borderBottom: DS.border, background: `${DS.card}F0`, backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shadow offset={3} size={2.5} radius={12}>
            <div style={{ position: "relative", width: 40, height: 40, background: p.color, border: DS.border, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎓</div>
          </Shadow>
          <span className="b" style={{ fontSize: 22, fontWeight: 800, color: DS.ink }}>DADDY DASHBOARD</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <button onClick={() => window.location.href = '/landingview'} className="n" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "none" }}>Landing</button>
          <button onClick={() => window.location.href = '/admindash'} className="n" style={{ color: DS.ink, cursor: "pointer", fontWeight: 700, background: "none", border: "none" }}>Dashboard</button>
          <button onClick={() => { signOut?.(); window.location.href = '/landingview'; }} className="n" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "none" }}>Sign out</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "44px 40px 8px" }}>
        <h1 className="b" style={{ fontSize: 56, fontWeight: 800, color: DS.ink, marginBottom: 8 }}>Welcome back!</h1>
        <Shadow offset={5} size={3} radius={DS.radius.md} style={{display:"inline-block"}}>
          <div style={{ position: "relative", background: p.color, border: DS.border, borderRadius: DS.radius.md, padding: "4px 32px", marginBottom: 12, transition: "background .35s" }}>
            <span className="b" style={{ fontSize: 56, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Who is learning today?</span>
          </div>
        </Shadow>
      </div>

      {/* Profile Cards */}
      <div style={{ position: "relative", zIndex: 5, padding: "0 40px 52px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginTop: 32 }}>
          {PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={(e) => {
                e.preventDefault();
                console.log('Clicked profile:', profile.id, profile.name, profile.isAdmin);
                if (profile.isAdmin) {
                  window.location.href = '/admindash';
                } else {
                  window.location.href = '/kiddash?child=' + profile.id;
                }
              }}
              style={{ 
                position: "relative", 
                width: 200, 
                background: profile.color, 
                border: DS.border, 
                borderRadius: DS.radius.lg, 
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform .2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translate(-4px,-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              <div style={{ background: "rgba(255,255,255,.3)", border: DS.border, borderRadius: DS.radius.md, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 48, lineHeight: 1 }}>{profile.emoji}</div>
              </div>
              {profile.year && (
                <div style={{ display: "inline-block", background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.5)", borderRadius: DS.radius.pill, padding: "2px 10px", marginBottom: 6 }}>
                  <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>{profile.year.toUpperCase()}</span>
                </div>
              )}
              <div className="b" style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{profile.name}</div>
              <p style={{ color: "rgba(255,255,255,.8)", fontSize: 12 }}>{profile.isAdmin ? 'Dashboard & Admin' : 'Student Access'}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
