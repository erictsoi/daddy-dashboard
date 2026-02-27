import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChildProfile } from '../types';
import { DS } from '../components/design-system';
import { DEMO_PROFILES } from '../data/demoProfiles';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getLocalData } from '../lib/dataService';

// Constants
const CARD_WIDTH = 220;
const CARD_HEIGHT = 320;
const CARD_MARGIN_TOP = -CARD_HEIGHT / 2;
const CARD_MARGIN_LEFT = -CARD_WIDTH / 2;
const CAROUSEL_OFFSET = 160;
const CAROUSEL_Z_INDEX_BASE = 100;
const SCALE_STEP = 0.1;
const ROTATION_STEP = 3;
const DELAY_DEALING = 800;
const DELAY_CAROUSEL = 1600;
const DELAY_FOOTER = 200;
const NAVIGATE_TIMEOUT = 1500;
const FILLER_COUNT = 3;
const SCALE_SELECTED = 1.5;

const BendayShadow = ({ offset = 3, size = 3, scale = 1 }: { offset?: number; size?: number; scale?: number }) => (
  <div style={{
    position: "absolute",
    top: offset / scale,
    left: offset / scale,
    right: -offset / scale,
    bottom: -offset / scale,
    zIndex: -1, pointerEvents: "none",
    backgroundImage: `radial-gradient(circle, ${DS.dotBrown} ${size / scale}px, transparent ${size / scale}px)`,
    backgroundSize: `${(size * 2.2) / scale}px ${(size * 2.2) / scale}px`,
    borderRadius: "inherit", opacity: 0.35,
    transition: "all 0.44s cubic-bezier(.34,1.56,.64,1)",
  }} />
);

const Shadow: React.FC<{ children: React.ReactNode; offset?: number; size?: number; radius?: number; style?: React.CSSProperties; scale?: number }> = ({ children, offset = 4, size = 3, radius, style = {}, scale = 1 }) => (
  <div style={{ position: "relative", borderRadius: radius, ...style }}>
    <BendayShadow offset={offset} size={size} scale={scale} />
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
const ProfileCard: React.FC<{ profile: any; isActive?: boolean; isReading?: boolean; scale?: number; onClick?: () => void }> = ({ profile, isActive, isReading, scale = 1, onClick }) => {
  const currentScale = (isReading ? SCALE_SELECTED : 1) * scale;
  return (
    <div className={isActive ? "bounce" : ""} style={{ width: "100%", height: "100%" }}>
      <Shadow offset={4} size={2.5} radius={16} scale={currentScale}>
        <div
          style={{
            position: "relative",
            background: profile.color,
            border: DS.border,
            borderRadius: 16,
            cursor: onClick ? "pointer" : "default",
            transition: "transform 0.15s",
            overflow: "visible",
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
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
                fontWeight: 900,
                fontFamily: "Baloo 2, cursive, sans-serif",
                color: profile.color,
                textTransform: "uppercase",
                letterSpacing: 1,
                textShadow: `0.5px 0 ${profile.color}, -0.5px 0 ${profile.color}, 0 0.5px ${profile.color}, 0 -0.5px ${profile.color}`
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
              margin: "0 0 6px 0",
              background: "white",
              padding: "8px"
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 3 }}>
                Age: {profile.age}
              </div>
              <div style={{ fontSize: 12, fontFamily: "Nunito, sans-serif", color: "#666", lineHeight: 1.3 }}>
                {profile.interests?.join(" · ")}
              </div>
            </div>
          </div>
        </div>
      </Shadow>
    </div>
  );
};


export const LandingView: React.FC = () => {
  const { children, user } = useAppContext();
  const navigate = useNavigate();

  const onNavigate = (view: { type: 'LANDING' } | { type: 'KIDSDASH'; childId: string } | { type: 'ADMIN' } | { type: 'HOME' }) => {
    if (view.type === 'KIDSDASH' && 'childId' in view) navigate(`/kiddash?child=${view.childId}`);
    else if (view.type === 'ADMIN' || view.type === 'HOME') navigate('/admindash');
    else if (view.type === 'LANDING') navigate('/');
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const [animationStage, setAnimationStage] = useState<'stack' | 'dealing' | 'carousel'>('stack');
  const [readingProfileId, setReadingProfileId] = useState<string | null>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isFiller = (id: string) => id.startsWith('filler');

  const RETURNING_PROFILES = useMemo(() => {
    if (user && children && children.length > 0) {
      return children.map(child => ({
        id: child.id,
        name: child.name,
        year: child.year,
        age: child.age,
        color: child.color,
        emoji: child.emoji,
        image: child.image,
        interests: child.interests
      }));
    }
    // Check localStorage for saved data (when not logged in)
    const localData = getLocalData();
    if (localData && localData.length > 0) {
      return localData.map(child => ({
        id: child.id,
        name: child.name,
        year: child.yearGroups[0]?.name || 'Year ?',
        age: undefined,
        color: child.themeColor,
        emoji: child.avatar,
        image: undefined,
        interests: undefined
      }));
    }
    return DEMO_PROFILES;
  }, [user, children]);

  const INITIAL_PROFILES = useMemo(() => Array.from({ length: FILLER_COUNT }, (_, i) => ({
    id: `filler${i + 1}`,
    name: "?",
    year: `Year ?`,
    color: i === 0 ? "#95A5A6" : i === 1 ? "#7F8C8D" : "#BDC3C7",
    emoji: "❓"
  })), []);

  const ALL_CARDS = useMemo(() => [...RETURNING_PROFILES, ...INITIAL_PROFILES], [RETURNING_PROFILES, INITIAL_PROFILES]);
  const TOTAL_RETURNING = RETURNING_PROFILES.length;

  const p = RETURNING_PROFILES[activeIndex] || RETURNING_PROFILES[0];

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage('dealing'), DELAY_DEALING);
    const timer2 = setTimeout(() => setAnimationStage('carousel'), DELAY_CAROUSEL);
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
  }, [ALL_CARDS]);

  const messyValues = useMemo(() => {
    return RETURNING_PROFILES.map((_, i) => ({
      messyRotate: ((i * 17) % 5) - 2,
      messyY: ((i * 23) % 10) - 5,
    }));
  }, [RETURNING_PROFILES]);

  useEffect(() => {
    if (animationStage === 'carousel') {
      const timer = setTimeout(() => setFooterVisible(true), DELAY_FOOTER);
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

  const handleCardClick = useCallback((index: number, profileId: string) => {
    if (animationStage !== 'carousel' || readingProfileId) return;
    if (isFiller(profileId)) return;

    const returningIndex = RETURNING_PROFILES.findIndex(p => p.id === profileId);

    if (returningIndex === activeIndex) {
      setReadingProfileId(profileId);
      setTimeout(() => {
        if (profileId === 'admin') {
          onNavigate({ type: 'ADMIN' });
        } else {
          onNavigate({ type: 'KIDSDASH', childId: profileId });
        }
        // Cleanup reading state in case navigation takes time or user stays on page
        setReadingProfileId(null);
      }, NAVIGATE_TIMEOUT);
    } else {
      setActiveIndex(returningIndex);
    }
  }, [animationStage, readingProfileId, activeIndex, RETURNING_PROFILES, onNavigate]);

  const goToPrev = () => {
    if (readingProfileId) return;
    setActiveIndex((activeIndex - 1 + TOTAL_RETURNING) % TOTAL_RETURNING);
  };

  const goToNext = () => {
    if (readingProfileId) return;
    setActiveIndex((activeIndex + 1) % TOTAL_RETURNING);
  };

  const getCarouselStyle = useCallback((index: number, profileId: string): { style: React.CSSProperties; scale: number } => {
    const returningIndex = RETURNING_PROFILES.findIndex(p => p.id === profileId);
    let offset = (returningIndex - activeIndex) % TOTAL_RETURNING;
    if (offset < 0) offset += TOTAL_RETURNING;
    if (offset > TOTAL_RETURNING / 2) offset -= TOTAL_RETURNING;

    const absOffset = Math.abs(offset);
    const isVisible = absOffset <= 2;

    const xOffset = offset * CAROUSEL_OFFSET + 120;
    const yOffset = 0;
    const scale = 1 - absOffset * SCALE_STEP;
    // Cards further from center should be behind. Use absOffset but ensure left side
    // is always behind right side at same distance (offset < 0 gets -1 to z-index)
    const zIndex = CAROUSEL_Z_INDEX_BASE - absOffset + (offset < 0 ? -1 : 0);
    const rotate = offset * ROTATION_STEP;

    const messy = messyValues[returningIndex];

    return {
      style: {
        transform: `translateX(calc(-50% + ${xOffset}px)) translateY(${yOffset + (messy?.messyY || 0)}px) scale(${scale}) rotate(${rotate + (messy?.messyRotate || 0)}deg)`,
        zIndex,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' as const : 'none' as const,
        transition: "all 0.44s cubic-bezier(.34,1.56,.64,1)",
      },
      scale,
    };
  }, [activeIndex, TOTAL_RETURNING, RETURNING_PROFILES, messyValues]);

  const getCardStyle = useCallback((index: number, profileId: string): { style: React.CSSProperties; scale: number } => {
    const isFillerCard = isFiller(profileId);

    // Handle "reading" mode - selected card scales up, others scale down
    if (readingProfileId) {
      if (profileId === readingProfileId) {
        return {
          style: {
            transform: `scale(${SCALE_SELECTED})`,
            zIndex: 1000,
            opacity: 1,
            transition: "transform 0.5s cubic-bezier(.34,1.56,.64,1)",
          },
          scale: 1,
        };
      }
      return {
        style: {
          transform: `scale(0.5)`,
          zIndex: 0,
          opacity: 0,
          transition: "all 0.3s ease-out",
        },
        scale: 1,
      };
    }

    if (animationStage === 'stack') {
      const offsets = cardOffsets[index];
      return {
        style: {
          transform: `translateX(calc(-50% + ${offsets.x + 120}px)) translateY(${offsets.y}px) scale(1) rotate(${offsets.rotate}deg)`,
          zIndex: ALL_CARDS.length - index,
          opacity: 1,
          transition: "all 0.5s cubic-bezier(.34,1.56,.64,1)",
        },
        scale: 1,
      };
    }

    if (animationStage === 'dealing') {
      if (isFillerCard) {
        return {
          style: {
            transform: `translateX(calc(-50% + ${cardOffsets[index].dealX}px)) translateY(1000px) scale(0.5) rotate(${cardOffsets[index].dealRotate}deg)`,
            zIndex: 0,
            opacity: 0,
            transition: "all 0.8s ease-in",
          },
          scale: 0.5,
        };
      }
      return getCarouselStyle(index, profileId);
    }

    if (animationStage === 'carousel') {
      if (isFillerCard) return { style: { opacity: 0, transform: "scale(0)", zIndex: -1 }, scale: 0 };

      return getCarouselStyle(index, profileId);
    }

    return { style: {}, scale: 1 };
  }, [readingProfileId, animationStage, cardOffsets, ALL_CARDS.length, getCarouselStyle]);

  const getInterestsText = () => {
    const interests = p?.interests || [];
    if (interests.length === 0) return "learning";
    if (interests.length === 1) return interests[0].toLowerCase();
    const last = interests[interests.length - 1];
    const others = interests.slice(0, -1).join(", ");
    return `${others} and ${last}`.toLowerCase();
  };

  const headerStyle: React.CSSProperties = {
    opacity: headerVisible ? 1 : 0,
    transform: headerVisible ? "translateY(0)" : "translateY(-20px)",
    transition: "all 0.5s ease-out",
    marginBottom: 40,
    paddingTop: 25,
    pointerEvents: headerVisible ? "auto" : "none",
  };

  const footerStyle: React.CSSProperties = {
    opacity: footerVisible ? 1 : 0,
    transform: footerVisible ? "translateY(0)" : "translateY(20px)",
    transition: "all 0.5s ease-out 0.2s",
    marginTop: "auto",
    paddingBottom: 24,
    pointerEvents: footerVisible ? "auto" : "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
            <button style={{ position: "relative", background: DS.ink, color: "#fff", fontWeight: 800, fontSize: 13, padding: "9px 22px", borderRadius: DS.radius.pill, border: DS.border, cursor: "pointer" }} onClick={() => onNavigate({ type: 'ADMIN' })}>Admin</button>
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
            const { style, scale } = getCardStyle(index, profile.id);
            const isReturning = !isFiller(profile.id);
            const isActive = isReturning && RETURNING_PROFILES.findIndex(p => p.id === profile.id) === activeIndex;
            const isCentered = isActive && animationStage === 'carousel';

            if (!isReturning && animationStage === 'carousel') return null;

            return (
              <div
                key={profile.id}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  marginLeft: CARD_MARGIN_LEFT,
                  marginTop: CARD_MARGIN_TOP,
                  transformOrigin: "center center",
                  transition: "all 0.44s cubic-bezier(.34,1.56,.64,1)",
                  ...style,
                }}
              >
                <ProfileCard
                  profile={profile}
                  isActive={isCentered}
                  isReading={profile.id === readingProfileId}
                  scale={scale}
                  onClick={isReturning && animationStage === 'carousel' ? () => handleCardClick(index, profile.id) : undefined}
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
                style={{
                  position: "relative",
                  background: p.color,
                  color: "#fff",
                  fontFamily: "'Baloo 2', cursive",
                  fontWeight: 800,
                  fontSize: 16,
                  padding: "12px 36px",
                  borderRadius: DS.radius.pill,
                  border: DS.border,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  transition: "transform .2s",
                  transform: hovered ? "translate(-2px,-2px)" : "none"
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                Select this profile 🚀
              </button>
            </Shadow>

            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: DS.inkFade, marginTop: 4 }}>
              Already have an account? <span style={{ color: p.color, cursor: "pointer", textDecoration: "underline" }} onClick={() => onNavigate({ type: 'LANDING' })}>Sign in here</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default LandingView;
