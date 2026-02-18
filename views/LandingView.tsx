import React, { useState, useEffect } from 'react';
import { ChildProfile } from '../types';
import { DS, GlobalStyles, Texture, Deco, Shadow, SolidShadow, Tag, getThemeColor } from '../components/design-system';

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
  const [activeIndex, setActiveIndex] = useState(0);

  const allProfiles = data.map(c => ({ ...c, isDaddy: false }));
  const total = allProfiles.length;
  const activeColor = getThemeColor(allProfiles[activeIndex % total]?.themeColor || 'blue').main;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex(a => (a - 1 + total) % total);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex(a => (a + 1) % total);
      } else if (e.key === 'Enter') {
        const profile = allProfiles[activeIndex % total];
        if (profile) {
          setView({ type: 'CHILD_DASHBOARD', childId: profile.id });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total, activeIndex, allProfiles, setView]);

  const childProfile = null; // Would be passed as prop in full refactor

  // Show loading if data is loading
  if (loading || !data || data.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: DS.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="b t-h1" style={{ color: DS.ink }}>Loading...</div>
      </div>
    );
  }

  if (childProfile) {
    const childColors = getThemeColor(childProfile.themeColor);
    return (
      <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
        <GlobalStyles />
        <Texture />
        <Deco color={childColors.main} />
        
        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" }}>
          <Shadow offset={6} size={3} radius={DS.radius.lg} style={{ maxWidth: 420, width: "100%" }}>
            <div style={{ position: "relative", background: childColors.tint, border: DS.border, borderRadius: DS.radius.lg, padding: "40px 32px", textAlign: "center" }}>
              <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)" }}>
                <Shadow offset={3} size={2.5} radius="50%">
                  <div style={{ position: "relative", width: 100, height: 100, background: DS.card, border: DS.border, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>{childProfile.avatar}</div>
                </Shadow>
              </div>
              <div style={{ marginTop: 70, marginBottom: 8 }}>
                <Tag label={`Year ${childProfile.yearGroups[0]?.name?.replace('Year ', '') || ''}`} color={childColors.main} dark />
              </div>
              <h1 className="b t-h1" style={{ color: DS.ink, marginBottom: 8 }}>{childProfile.name}'s Space</h1>
              <p className="n" style={{ color: DS.inkSoft, fontSize: 16, marginBottom: 32 }}>Ready to learn today?</p>
              
              <Shadow offset={4} size={3} radius={DS.radius.pill} style={{display:"inline-block"}}>
                <button 
                  onClick={() => setView({ type: 'CHILD_DASHBOARD', childId: childProfile.id })}
                  className="b"
                  style={{ position: "relative", background: childColors.main, color: "#fff", fontWeight: 800, fontSize: 18, padding: "14px 40px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer", transition: "transform .2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  Let's Learn! 🚀
                </button>
              </Shadow>
              
              <div style={{ marginTop: 24 }}>
                <button onClick={() => signOut?.()} className="n t-small" style={{ color: DS.inkFade, cursor: "pointer", background: "none", border: "none" }}>Sign out</button>
              </div>
            </div>
          </Shadow>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
      <GlobalStyles />
      <Texture />
      <Deco color={activeColor} />

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", borderBottom: DS.border, background: `${DS.card}F0`, backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shadow offset={3} size={2.5} radius={12}>
            <div style={{ position: "relative", width: 40, height: 40, background: activeColor, border: DS.border, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎓</div>
          </Shadow>
          <span className="b t-h2" style={{ color: DS.ink }}>DADDY DASHBOARD</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {user ? (
            <>
              <button onClick={() => setView({ type: 'HOME' })} className="n t-small" style={{ color: DS.ink, cursor: "pointer", fontWeight: 700, background: "none", border: "none" }}>Dashboard</button>
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
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "20px 40px 8px" }}>
        <h1 className="b t-hero" style={{ color: DS.ink, marginBottom: 8 }}>Who's ready for an</h1>
        <div style={{ position: "relative", background: activeColor, border: DS.border, borderRadius: DS.radius.md, padding: "4px 32px", marginBottom: 8, display: "inline-block", boxShadow: "6px 6px 0 rgba(45,45,45,0.2)" }}>
          <span className="b" style={{ fontSize: 56, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>ADVENTURE?</span>
        </div>
        <p className="n" style={{ fontSize: 17, fontWeight: 700, color: DS.inkSoft, marginTop: 8, marginBottom: 16 }}>Pick your hero to start your learning mission!</p>
      </div>

      {/* PROFILE CARDS CAROUSEL - CASCADE STYLE */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 60px", marginBottom: 16 }}>
        {/* Carousel Container */}
        <div style={{ position: "relative", height: 320, width: "100%", maxWidth: 900, perspective: "1000px" }}>
          {allProfiles.map((profile, i) => {
            const isActive = i === activeIndex % total;
            const colors = getThemeColor(profile.themeColor);
            
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
                key={profile.id || i}
                onClick={() => {
                  if (isA) {
                    setView({ type: 'HOME' });
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
                    background: isA ? colors.main : colors.tint, 
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
                      <div style={{ fontSize: 48, lineHeight: 1 }}>{profile.avatar}</div>
                    </div>
                    <div style={{ display: "inline-block", background: isA ? "rgba(255,255,255,.2)" : colors.tint, border: `2px solid ${isA ? "rgba(255,255,255,.5)" : colors.main}`, borderRadius: DS.radius.pill, padding: "2px 10px" }}>
                      <span className="n t-label" style={{ color: isA ? "#fff" : colors.main, fontSize: 9 }}>{profile.yearGroups?.[0]?.name || 'Student'}</span>
                    </div>
                    <div className="b" style={{ fontSize: 28, fontWeight: 800, color: isA ? "#fff" : DS.ink, marginTop:8, marginBottom: 8 }}>{profile.name}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(profile.interests || ['Learning', 'Fun', 'Growth']).slice(0, 3).map(int => (
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
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
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
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
        >
          ›
        </button>
      </div>

      {/* CTA */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "0 40px 40px" }}>
        <p style={{ fontSize: 17, color: DS.inkFade, marginBottom: 20 }}>Choose the profile closest to your child</p>
          <button className="b"
            onClick={() => {
              setView({ type: 'HOME' });
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
            style={{ position: "relative", background: activeColor, color: "#fff", fontWeight: 800, fontSize: 20, padding: "16px 52px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer", transition: "transform .2s", boxShadow: "8px 8px 0 #1a1a2e" }}>
            START LEARNING 🚀
          </button>
      </div>

      {/* Guest Mode Notice */}
      {!user && data.length === 0 && (
        <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "0 40px 52px" }}>
          <Shadow offset={3} size={2.5} radius={DS.radius.md}>
            <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.md, padding: "24px 32px", textAlign: "left", display: "inline-block", maxWidth: 480, width: "100%" }}>
              <h3 className="b t-h3" style={{ color: DS.ink, marginBottom: 8 }}>For Kids</h3>
              <p className="n t-body" style={{ color: DS.inkSoft, marginBottom: 16 }}>Enter your parent's email to access your profile</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  value={parentEmailInput}
                  onChange={(e) => setParentEmailInput(e.target.value)}
                  placeholder="parent@email.com"
                  style={{ flex: 1, padding: "12px 16px", border: DS.border, borderRadius: DS.radius.sm, fontSize: 14, fontFamily: "Nunito Sans", outline: "none" }}
                  autoFocus
                />
                <Shadow offset={2} size={2} radius={DS.radius.sm}>
                  <button
                    onClick={() => {
                      localStorage.setItem('parent_email', parentEmailInput);
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
