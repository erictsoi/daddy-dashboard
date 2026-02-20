import React, { useState, useEffect } from 'react';
import { ChildProfile } from '../types';
import { DS, GlobalStyles, Texture, Deco, Shadow, SolidShadow, Tag } from '../components/design-system';
import { useNavigate } from 'react-router-dom';

interface LandingViewProps {
  data: ChildProfile[];
  user: any;
  loading: boolean;
  adminAvatar: string;
  adminName: string;
  parentEmailInput: string;
  setParentEmailInput: (v: string) => void;
  signInWithGoogle?: () => void;
  signOut?: () => void;
  setView: (v: any) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  data,
  user,
  loading,
  adminAvatar,
  adminName,
  parentEmailInput,
  setParentEmailInput,
  signInWithGoogle,
  signOut,
  setView,
}) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // 6 Default profiles from daddy_dashboard_v6_fixed.jsx
  const PROFILES = [
    { id: "amara", name: "Amara", year: "Year 1", age: "5–6", color: "#FF6B6B", tint: "#FFF0F0", emoji: "🦋", interests: ["Animals", "Drawing", "Singing", "Nature"] },
    { id: "marcus", name: "Marcus", year: "Year 3", age: "7–8", color: "#4CAF8A", tint: "#EDFAF4", emoji: "🦖", interests: ["Dinosaurs", "Football", "Building", "Comics"] },
    { id: "sophia", name: "Sophia", year: "Year 5", age: "9–10", color: "#9B6DD6", tint: "#F3EEFF", emoji: "🎨", interests: ["Art", "Dance", "Music", "Sports"] },
    { id: "kai", name: "Kai", year: "Year 7", age: "11–12", color: "#F5A623", tint: "#FFF8EC", emoji: "🛹", interests: ["Gaming", "Skateboarding", "History", "Film"] },
    { id: "adrian", name: "Adrian", year: "Year 9", age: "13–14", color: "#2B8ED4", tint: "#EAF4FC", emoji: "🏀", interests: ["Design", "Maths", "Science", "Basketball"] },
    { id: "rohan", name: "Rohan", year: "Year 11", age: "15–16", color: "#E8507A", tint: "#FFF0F5", emoji: "📸", interests: ["Coding", "Photography", "Film", "Economics"] },
  ];

  const total = PROFILES.length;
  const p = PROFILES[activeIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex(a => (a - 1 + total) % total);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex(a => (a + 1) % total);
      } else if (e.key === 'Enter') {
        navigate(`/child/${p.id}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total, activeIndex, p, setView]);

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: DS.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="b t-h1" style={{ color: DS.ink }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
      <GlobalStyles />
      <Texture />
      <Deco color={p.color} />

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", borderBottom: DS.border, background: `${DS.card}F0`, backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shadow offset={3} size={2.5} radius={12}>
            <div style={{ position: "relative", width: 40, height: 40, background: p.color, border: DS.border, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎓</div>
          </Shadow>
          <span className="b t-h2" style={{ color: DS.ink }}>DADDY DASHBOARD</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {/* Debug Nav */}
          <div style={{ display: "flex", gap: 6, marginRight: 16, paddingRight: 16, borderRight: "2px solid #ddd" }}>
            <button onClick={() => navigate('/')} className="n t-small" style={{ color: DS.ink, cursor: "pointer", fontWeight: 700, background: "none", border: "1px solid #ccc", padding: "4px 8px", borderRadius: 4 }}>Landing</button>
            <button onClick={() => navigate('/returning')} className="n t-small" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "1px solid #ccc", padding: "4px 8px", borderRadius: 4 }}>Return</button>
            <button onClick={() => navigate('/dashboard')} className="n t-small" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "1px solid #ccc", padding: "4px 8px", borderRadius: 4 }}>Admin</button>
            <button onClick={() => navigate('/child/sophia')} className="n t-small" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "1px solid #ccc", padding: "4px 8px", borderRadius: 4 }}>Sophia</button>
            <button onClick={() => navigate('/child/adrian')} className="n t-small" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "1px solid #ccc", padding: "4px 8px", borderRadius: 4 }}>Adrian</button>
            <button onClick={() => navigate('/curriculum')} className="n t-small" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "1px solid #ccc", padding: "4px 8px", borderRadius: 4 }}>Curriculum</button>
            <button onClick={() => navigate('/manage')} className="n t-small" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "1px solid #ccc", padding: "4px 8px", borderRadius: 4 }}>Manage</button>
          </div>
          {user ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="n t-small" style={{ color: DS.ink, cursor: "pointer", fontWeight: 700, background: "none", border: "none" }}>Dashboard</button>
              <button onClick={() => navigate('/manage')} className="n t-small" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "none" }}>Manage</button>
              <button onClick={() => signOut?.()} className="n t-small" style={{ color: DS.inkSoft, cursor: "pointer", fontWeight: 700, background: "none", border: "none" }}>Sign out</button>
            </>
          ) : (
            <>
              <span className="n t-small" style={{ color: DS.ink, cursor: "pointer", fontWeight: 700 }}>HOW IT WORKS</span>
              <Shadow offset={3} size={2.5} radius={DS.radius.pill}>
                <button 
                  onClick={() => signInWithGoogle?.()}
                  disabled={loading}
                  className="n" 
                  style={{ position: "relative", background: DS.ink, color: "#fff", fontWeight: 800, fontSize: 13, padding: "9px 22px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer", opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? '...' : 'SIGN IN'}
                </button>
              </Shadow>
            </>
          )}
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

      {/* PROFILE CARDS CAROUSEL - CASCADE STYLE */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 60px", marginBottom: 16 }}>
        {/* Carousel Container */}
        <div style={{ position: "relative", height: 320, width: "100%", maxWidth: 900, perspective: "1000px" }}>
          {PROFILES.map((profile, i) => {
            const isActive = i === activeIndex % total;
            
            // Calculate distance from active
            const off = ((i - (activeIndex % total)) + total) % total;
            const dist = off > total / 2 ? off - total : off;
            const abs = Math.abs(dist);
            
            // Show only 5 cards (center + 2 on each side)
            if (abs > 2) return null;
            
            const isA = dist === 0;
            
            // Cascade transform with perspective
            const transform = isA 
              ? `translateX(calc(-50%)) scale(1)`
              : `translateX(calc(-50% + ${dist * 130}px)) scale(${1 - abs * 0.17}) perspective(16px) rotateY(${dist > 0 ? '-5deg' : '5deg'})`;
            const zIndex = 10 - abs;
            const opacity = abs === 0 ? 1 : abs > 2 ? 0 : 0.7 - abs * 0.2;
            const filter = abs > 0 ? `blur(${abs * 2}px)` : 'none';
            
            return (
              <div
                key={profile.id}
                onClick={() => {
                  if (isA) {
                    navigate('/dashboard');
                  } else {
                    setActiveIndex(i);
                  }
                }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  transform,
                  zIndex,
                  opacity,
                  filter,
                  transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  cursor: "pointer",
                }}
              >
                <div 
                  style={{ 
                    position: "relative", 
                    width: 200, 
                    height: 280, 
                    background: isA ? profile.color : profile.tint, 
                    border: DS.border, 
                    borderRadius: DS.radius.lg, 
                    padding: "20px 16px", 
                    boxShadow: `${(isA ? 5 : 3) * 2}px ${(isA ? 5 : 3) * 2}px 0 rgba(45,45,45,0.2)`,
                    transition: "all .4s"
                  }}
                >
                    {isA && (
                      <div style={{ position: "absolute", top: -12, right: 10 }}>
                        <div style={{ background: "#FF6B6B", color: "#fff", fontSize: 10, fontWeight: 900, padding: "4px 12px", borderRadius: DS.radius.pill, border: DS.border, fontFamily: "Nunito,sans-serif", letterSpacing: .5 }}>★ ACTIVE</div>
                      </div>
                    )}
                    <div style={{ background: "rgba(255,255,255,.3)", border: DS.border, borderRadius: DS.radius.md, padding: 8, marginBottom: 10, textAlign: "center" }}>
                      <div style={{ fontSize: 48, lineHeight: 1 }}>{profile.emoji}</div>
                    </div>
                    <div style={{ display: "inline-block", background: isA ? "rgba(255,255,255,.2)" : profile.tint, border: `2px solid ${isA ? "rgba(255,255,255,.5)" : profile.color}`, borderRadius: DS.radius.pill, padding: "2px 10px" }}>
                      <span className="n t-label" style={{ color: isA ? "#fff" : profile.color, fontSize: 9 }}>{profile.year}</span>
                    </div>
                    <div className="b" style={{ fontSize: 28, fontWeight: 800, color: isA ? "#fff" : DS.ink, marginTop:8, marginBottom: 8 }}>{profile.name}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {profile.interests.slice(0, 3).map(int => (
                        <span key={int} style={{ background: isA ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.06)", border: `1.5px solid ${isA ? "rgba(255,255,255,.5)" : DS.ink}`, borderRadius: DS.radius.pill, padding: "1px 8px", fontSize: 8, fontWeight: 800, color: isA ? "#fff" : DS.ink, fontFamily: "Nunito,sans-serif" }}>{int.toUpperCase()}</span>
                      ))}
                    </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => setActiveIndex(a => (a - 1 + total) % total)}
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%)",
            color: DS.ink,
            background: "none",
            border: "none",
            fontSize: 56,
            fontWeight: "bold",
            cursor: "pointer",
            opacity: 0.4,
            transition: "opacity 0.3s",
            zIndex: 20,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
        >
          ‹
        </button>
        <button
          onClick={() => setActiveIndex(a => (a + 1) % total)}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            color: DS.ink,
            background: "none",
            border: "none",
            fontSize: 56,
            fontWeight: "bold",
            cursor: "pointer",
            opacity: 0.4,
            transition: "opacity 0.3s",
            zIndex: 20,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
        >
          ›
        </button>
      </div>

      {/* CTA */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "0 40px 40px" }}>
        <p className="b" style={{ fontSize: 20, fontWeight: 700, color: DS.ink, marginBottom: 6 }}>
          "Welcome back,{" "}
          <span style={{ background: p.color, color: "#fff", padding: "1px 12px", borderRadius: DS.radius.sm, border: DS.border }}>{p.name}</span>!
          {" "}Ready to learn something amazing?"
        </p>
        <p className="n t-small" style={{ color: DS.inkFade, marginBottom: 26 }}>Choose the profile closest to your child</p>
        <Shadow offset={4} size={3} radius={DS.radius.pill} style={{ display: "inline-block" }}>
          <button className="b"
            onClick={() => {
              navigate('/dashboard');
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
            style={{ position: "relative", background: p.color, color: "#fff", fontWeight: 800, fontSize: 20, padding: "16px 52px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer", transition: "transform .2s" }}>
            START LEARNING 🚀
          </button>
        </Shadow>
        <div style={{ marginTop: 12 }}>
          <span className="n t-small" style={{ color: DS.inkFade }}>Not you? </span>
          <span className="n t-small" style={{ color: p.color, fontWeight: 800, cursor: "pointer", borderBottom: `2.5px solid ${p.color}` }}>Switch Hero</span>
        </div>
      </div>

      {/* Guest Mode Notice */}
      {!user && (
        <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "0 40px 52px" }}>
          <Shadow offset={3} size={2.5} radius={DS.radius.md}>
            <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.md, padding: "24px 32px", textAlign: "left", display: "inline-block", maxWidth: 480, width: "100%" }}>
              <h3 className="b t-h3" style={{ color: DS.ink, marginBottom: 8 }}>For Kids</h3>
              <p className="n t-body" style={{ color: DS.inkSoft, marginBottom: 16 }}>Enter your parent's email to access your profile</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  id="parent-email"
                  name="parentEmail"
                  value={parentEmailInput}
                  onChange={(e) => setParentEmailInput(e.target.value)}
                  placeholder="parent@email.com"
                  style={{ flex: 1, padding: "12px 16px", border: DS.border, borderRadius: DS.radius.sm, fontSize: 14, fontFamily: "Nunito Sans", outline: "none" }}
                  autoFocus
                />
                <Shadow offset={2} size={2} radius={DS.radius.sm}>
                  <button
                    onClick={() => {
                      signInWithGoogle?.();
                    }}
                    disabled={!parentEmailInput || loading}
                    className="n"
                    style={{ position: "relative", background: DS.ink, color: "#fff", fontWeight: 800, fontSize: 13, padding: "12px 20px", borderRadius: DS.radius.sm, border: DS.border, cursor: "pointer", opacity: !parentEmailInput || loading ? 0.6 : 1 }}
                  >
                    Sign In
                  </button>
                </Shadow>
              </div>
              <p className="n t-small" style={{ color: DS.inkFade, marginTop: 16 }}>You're viewing demo mode. Sign in to save your curriculum.</p>
            </div>
          </Shadow>
        </div>
      )}
    </div>
  );
};
