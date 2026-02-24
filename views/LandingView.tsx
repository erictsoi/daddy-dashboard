import React, { useState, useEffect, useMemo } from 'react';
import { getDummyProfiles } from '../src/data/dummyData';

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

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { font-family: 'Nunito Sans', sans-serif; background: #FAF6F0; color: #1A1A2E; }
    .b  { font-family: 'Baloo 2', cursive; }
    .n  { font-family: 'Nunito', sans-serif; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    @keyframes fadeIn { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
    .float { animation: float 3s ease-in-out infinite; }
    .fadeIn { animation: fadeIn 0.3s ease-out both; }
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

const Tag = ({ label, color, dark = false }: { label: string; color: string; dark?: boolean }) => (
  <Shadow offset={2} size={2} radius={DS.radius.pill} style={{ display: "inline-block" }}>
    <div style={{ position: "relative", background: dark ? DS.ink : color, border: DS.border, borderRadius: DS.radius.pill, padding: "3px 13px" }}>
      <span className="n" style={{ color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
    </div>
  </Shadow>
);

// Pokemon-style Profile Card Component
const ProfileCard: React.FC<{ profile: typeof RETURNING_PROFILES[0]; isActive?: boolean; onClick?: () => void }> = ({ profile, isActive, onClick }) => (
  <Shadow offset={isActive ? 5 : 3} size={isActive ? 3 : 2.5} radius={16}>
    <div 
      style={{ 
        position: "relative", 
        background: profile.color, 
        border: DS.border, 
        borderRadius: 16, 
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s",
        overflow: "visible",
        width: 220,
        height: 320,
        padding: 10
      }}
      onClick={onClick}
    >
      {isActive && (
        <div style={{ position: "absolute", top: -12, right: -4, zIndex: 20 }}>
          <Shadow offset={2} size={2} radius={DS.radius.pill}>
            <div className="fadeIn" style={{ position: "relative", background: "#FF6B6B", color: "#fff", fontSize: 8, fontWeight: 900, padding: "4px 8px", borderRadius: DS.radius.pill, border: DS.border, fontFamily: "Nunito,sans-serif", letterSpacing: .5 }}>ACTIVE</div>
          </Shadow>
        </div>
      )}
      {/* Inner white card with black border */}
      <div style={{
        width: "100%",
        height: "100%",
        background: "white",
        borderRadius: 8,
        border: "3px solid black",
        overflow: "hidden"
      }}>
        {/* Name and Year at top */}
        <div style={{
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px"
        }}>
          <span style={{ 
            fontSize: 14, 
            fontWeight: 800, 
            color: profile.color,
            textTransform: "uppercase",
            letterSpacing: 1
          }}>
            {profile.name}
          </span>
          <span style={{ 
            fontSize: 11, 
            fontWeight: 700, 
            color: "#333"
          }}>
            {profile.year}
          </span>
        </div>

        {/* Rectangular image */}
        <div style={{
          width: 170,
          height: 180,
          margin: "0 auto",
          border: "3px solid black",
          borderRadius: 4,
          overflow: "hidden",
          background: "white"
        }}>
          <img 
            src={profile.image} 
            alt={profile.name}
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover"
            }}
          />
        </div>

        {/* Metadata rectangle */}
        <div style={{
          width: 170,
          height: 60,
          margin: "0 auto 6px",
          background: "white",
          padding: "8px"
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 3 }}>
            Age: {profile.age}
          </div>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.3 }}>
            {profile.interests?.join(" · ")}
          </div>
        </div>
      </div>
    </div>
  </Shadow>
);

const RETURNING_PROFILES = getDummyProfiles().slice(0, 6);

const INITIAL_PROFILES = [
  { id: "filler1", name: "?", year: "Year ?", color: "#95A5A6", emoji: "❓" },
  { id: "filler2", name: "?", year: "Year ?", color: "#7F8C8D", emoji: "❓" },
  { id: "filler3", name: "?", year: "Year ?", color: "#BDC3C7", emoji: "❓" },
];

const ALL_CARDS = [...RETURNING_PROFILES, ...INITIAL_PROFILES];
const TOTAL_RETURNING = RETURNING_PROFILES.length;

const INTERESTS: Record<string, string[]> = {
  admin: ["Dashboard", "Settings", "Admin"],
  amara: ["Animals", "Drawing", "Singing", "Nature"],
  marcus: ["Dinosaurs", "Football", "Building", "Comics"],
  sophia: ["Art", "Dance", "Music", "Sports"],
  kai: ["Gaming", "Skateboarding", "History", "Film"],
  adrian: ["Design", "Maths", "Science", "Basketball"],
  rohan: ["Coding", "Photography", "Film", "Economics"],
};

export const LandingView: React.FC = () => {
  const sophiaIndex = RETURNING_PROFILES.findIndex(p => p.id === 'sophia');
  const [activeIndex, setActiveIndex] = useState(sophiaIndex >= 0 ? sophiaIndex : TOTAL_RETURNING - 1);
  const [animationStage, setAnimationStage] = useState<'stack' | 'dealing' | 'carousel'>('stack');
  const [readingProfileId, setReadingProfileId] = useState<string | null>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  
  const isFiller = (id: string) => id.startsWith('filler');
  const p = RETURNING_PROFILES[activeIndex];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage('dealing'), 800);
    const timer2 = setTimeout(() => setAnimationStage('carousel'), 1600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const cardOffsets = useMemo(() => {
    return ALL_CARDS.map((_, i) => ({
      x: ((i * 7) % 16) - 8,
      y: ((i * 23) % 20) - 10,
      rotate: ((i * 17) % 5) - 2,
      dealX: ((i * 100) % 1000) - 500,
      dealRotate: ((i * 50) % 90) - 45,
    }));
  }, []);

  const messyValues = useMemo(() => {
    return RETURNING_PROFILES.map((_, i) => ({
      messyRotate: ((i * 17) % 5) - 2,
      messyY: ((i * 23) % 10) - 5,
    }));
  }, []);

  useEffect(() => {
    if (animationStage === 'carousel') {
      const timer = setTimeout(() => setFooterVisible(true), 200);
      return () => clearTimeout(timer);
    } else {
      setFooterVisible(false);
    }
  }, [animationStage]);

  useEffect(() => {
    if (readingProfileId) {
      setHeaderVisible(false);
      setFooterVisible(false);
    }
  }, [readingProfileId]);

  const handleCardClick = (index: number, profileId: string) => {
    if (animationStage !== 'carousel' || readingProfileId) return;
    if (isFiller(profileId)) return;

    const returningIndex = RETURNING_PROFILES.findIndex(p => p.id === profileId);
    
    if (returningIndex === activeIndex) {
      setReadingProfileId(profileId);
      setTimeout(() => {
        window.location.href = profileId === 'admin' ? '/admindash' : `/kiddash?child=${profileId}`;
      }, 1500);
    } else {
      setActiveIndex(returningIndex);
    }
  };

  const goToPrev = () => {
    if (readingProfileId) return;
    setActiveIndex((activeIndex - 1 + TOTAL_RETURNING) % TOTAL_RETURNING);
  };

  const goToNext = () => {
    if (readingProfileId) return;
    setActiveIndex((activeIndex + 1) % TOTAL_RETURNING);
  };

  const getCardStyle = (index: number, profileId: string): React.CSSProperties => {
    const isFillerCard = isFiller(profileId);
    
    // Handle "reading" mode - selected card scales up, others scale down
    if (readingProfileId) {
      if (profileId === readingProfileId) {
        return {
          transform: `scale(1.5)`,
          zIndex: 1000,
          opacity: 1,
          transition: "transform 0.5s cubic-bezier(.34,1.56,.64,1)",
        };
      }
      return {
        transform: `scale(0.5)`,
        zIndex: 0,
        opacity: 0,
        transition: "all 0.3s ease-out",
      };
    }
    
    if (animationStage === 'stack') {
      const offsets = cardOffsets[index];
      return {
        transform: `translateX(calc(-50% + ${offsets.x + 120}px)) translateY(${offsets.y}px) scale(1) rotate(${offsets.rotate}deg)`,
        zIndex: ALL_CARDS.length - index,
        opacity: 1,
        transition: "all 0.5s cubic-bezier(.34,1.56,.64,1)",
      };
    }

    if (animationStage === 'dealing') {
      if (isFillerCard) {
        return {
          transform: `translateX(calc(-50% + ${cardOffsets[index].dealX}px)) translateY(1000px) scale(0.5) rotate(${cardOffsets[index].dealRotate}deg)`,
          zIndex: 0,
          opacity: 0,
          transition: "all 0.8s ease-in",
        };
      }
      return getCarouselStyle(index, profileId);
    }

    if (animationStage === 'carousel') {
      if (isFillerCard) return { opacity: 0, scale: 0, zIndex: -1 };
      
      return getCarouselStyle(index, profileId);
    }

    return {};
  };

  const getCarouselStyle = (index: number, profileId: string): React.CSSProperties => {
    const returningIndex = RETURNING_PROFILES.findIndex(p => p.id === profileId);
    let offset = (returningIndex - activeIndex) % TOTAL_RETURNING;
    if (offset < 0) offset += TOTAL_RETURNING;
    if (offset > TOTAL_RETURNING / 2) offset -= TOTAL_RETURNING;
    
    const absOffset = Math.abs(offset);
    const isVisible = absOffset <= 2;

    const xOffset = offset * 160 + 120;
    const yOffset = 0;
    const scale = 1 - absOffset * 0.1;
    const zIndex = 100 - absOffset;
    const rotate = offset * 3;

    const messy = messyValues[returningIndex];

    return {
      transform: `translateX(calc(-50% + ${xOffset}px)) translateY(${yOffset + messy.messyY}px) scale(${scale}) rotate(${rotate + messy.messyRotate}deg)`,
      zIndex,
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' as const : 'none' as const,
      transition: "all 0.44s cubic-bezier(.34,1.56,.64,1)",
    };
  };

  const getInterestsText = () => {
    const interests = INTERESTS[p.id] || [];
    if (interests.length === 0) return "learning";
    if (interests.length === 1) return interests[0].toLowerCase();
    const last = interests[interests.length - 1];
    const others = interests.slice(0, -1).join(", ");
    return `${others} and ${last}`.toLowerCase();
  };

  const headerStyle: React.CSSProperties = headerVisible 
    ? { opacity: 1, transform: "translateY(0)", transition: "all 0.5s ease-out", marginBottom: 40, paddingTop: 25 }
    : { opacity: 0, transform: "translateY(-50px)", transition: "all 0.5s ease-out", pointerEvents: "none" as const };

  const footerStyle: React.CSSProperties = footerVisible
    ? { opacity: 1, transform: "translateY(0)", transition: "all 0.5s ease-out 0.2s", marginTop: "auto", paddingBottom: 24 }
    : { opacity: 0, transform: "translateY(50px)", transition: "all 0.5s ease-out", pointerEvents: "none" as const };

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <GlobalStyles />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: 'radial-gradient(circle, #1A1A2E08 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.3 }} />

      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 40px", borderBottom: DS.border, background: `${DS.card}F0`, backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shadow offset={3} size={2.5} radius={12}>
            <div style={{ position: "relative", width: 40, height: 40, background: p.color, border: DS.border, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎓</div>
          </Shadow>
          <span style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, fontWeight: 800, color: DS.ink }}>DADDY DASHBOARD</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: DS.ink, cursor: "pointer" }}>HOW IT WORKS</span>
          <Shadow offset={3} size={2.5} radius={DS.radius.pill}>
            <button style={{ position: "relative", background: DS.ink, color: "#fff", fontWeight: 800, fontSize: 13, padding: "9px 22px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer" }} onClick={() => window.location.href = '/admindash'}>Admin</button>
          </Shadow>
        </div>
      </nav>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 40px 24px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        
        <div style={headerStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-block", transform: "rotate(-2deg)" }}>
              <Shadow offset={5} size={3} radius={DS.radius.lg}>
                <div style={{ position: "relative", background: p.color, border: DS.border, borderRadius: DS.radius.lg, padding: "8px 32px" }}>
                  <h1 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>Who are we learning with Today?</h1>
                </div>
              </Shadow>
            </div>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: DS.inkSoft, marginTop: 25, textTransform: "uppercase", letterSpacing: "0.1em" }}>select the profile that best matches your child's age and interests.</p>
          </div>
        </div>

        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 400, padding: "0 40px" }}>
          {animationStage === 'carousel' && !readingProfileId && (
            <>
              <button onClick={goToPrev} style={{ position: "absolute", left: 20, width: 44, height: 44, borderRadius: "50%", border: DS.border, background: DS.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "3px 3px #3D2B1F", zIndex: 100 }}>←</button>
              <button onClick={goToNext} style={{ position: "absolute", right: 20, width: 44, height: 44, borderRadius: "50%", border: DS.border, background: DS.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "3px 3px #3D2B1F", zIndex: 100 }}>→</button>
            </>
          )}
          {ALL_CARDS.map((profile, index) => {
            const style = getCardStyle(index, profile.id);
            const isReturning = !isFiller(profile.id);
            const isActive = isReturning && RETURNING_PROFILES.findIndex(p => p.id === profile.id) === activeIndex;
            const isCentered = isActive && animationStage === 'carousel';

            if (!isReturning && animationStage === 'carousel') return null;

            return (
              <div
                key={profile.id}
                onClick={() => isReturning && handleCardClick(index, profile.id)}
                style={{ 
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 220,
                  height: 320,
                  marginLeft: -110,
                  marginTop: -160,
                  transformOrigin: "center center",
                  cursor: isReturning && animationStage === 'carousel' ? 'pointer' : 'default',
                  transition: "all 0.44s cubic-bezier(.34,1.56,.64,1)",
                  ...style,
                }}
              >
                <ProfileCard 
                  profile={profile} 
                  isActive={isCentered}
                  onClick={() => isReturning && handleCardClick(index, profile.id)}
                />
              </div>
            );
          })}
        </div>

        <div style={footerStyle}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <p style={{ fontFamily: "'Baloo 2', cursive", fontSize: 18, fontWeight: 700, color: DS.ink, maxWidth: 580, padding: "0 20px", textAlign: "center", minHeight: 56, lineHeight: 1.5 }}>
              <span style={{ background: p.color, color: "#fff", padding: "4px 14px", borderRadius: 6, marginRight: 6, whiteSpace: "nowrap", display: "inline-block" }}>{p.name}</span> 
              is a {p.year} Learner who loves {getInterestsText()}. A great match for ages {p.age}.
            </p>
            
            <Shadow offset={4} size={3} radius={DS.radius.pill}>
              <button
                onClick={() => handleCardClick(activeIndex, p.id)}
                style={{ position: "relative", background: p.color, color: "#fff", fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 16, padding: "12px 36px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", transition: "transform .2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                Select this profile 🚀
              </button>
            </Shadow>

            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: DS.inkFade, marginTop: 4 }}>
              Already have an account? <span style={{ color: p.color, cursor: "pointer", textDecoration: "underline" }} onClick={() => window.location.href = '/returningview'}>Sign in here</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default LandingView;
