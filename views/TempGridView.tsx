import React, { useState, useEffect, useMemo } from 'react';
import { getDummyProfiles } from '../src/data/dummyData';

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
    .t-small { font-size: 12px; fontWeight: 600; line-height: 1.5; }
    .t-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    @keyframes fadeUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
  `}</style>
);

const Texture = () => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `radial-gradient(circle, #1A1A2E08 1px, transparent 1px)`,
    backgroundSize: "20px 20px"
  }} />
);

const Shadow: React.FC<{ children: React.ReactNode; offset?: number; size?: number; radius?: number; style?: React.CSSProperties }> = ({ children, offset = 3, size = 2.5, radius, style = {} }) => (
  <div style={{ position: "relative", borderRadius: radius, ...style }}>
    <div style={{
      position: "absolute", top: offset, left: offset, right: -offset, bottom: -offset,
      zIndex: -1, pointerEvents: "none",
      backgroundImage: `radial-gradient(circle, ${DS.dotBrown} ${size}px, transparent ${size}px)`,
      backgroundSize: `${size * 2.2}px ${size * 2.2}px`,
      borderRadius: "inherit", opacity: 0.35,
    }} />
    {children}
  </div>
);

const PROFILES = getDummyProfiles();

const ProfileCard: React.FC<{ profile: typeof PROFILES[0]; onClick?: () => void }> = ({ profile, onClick }) => (
  <Shadow offset={3} size={2.5} radius={16}>
    <div 
      style={{ 
        position: "relative", 
        background: profile.color, 
        border: DS.border, 
        borderRadius: 16, 
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s",
        overflow: "hidden",
        width: 220,
        height: 320,
        padding: 10
      }}
      onClick={onClick}
    >
      {/* Inner white card with black border */}
      <div style={{
        width: "100%",
        height: "100%",
        background: "white",
        borderRadius: 8,
        border: "3px solid black",
        overflow: "hidden"
      }}>
        {/* Name and Year at top - no bottom border */}
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

        {/* Rectangular image - touches name bar */}
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

        {/* Metadata rectangle - no border */}
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

export const TempGridView: React.FC = () => {
  const profiles = PROFILES;
  const TOTAL = profiles.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationStage, setAnimationStage] = useState<'stack' | 'dealing' | 'carousel'>('stack');
  
  const cardOffsets = useMemo(() => {
    return profiles.map((_, i) => ({
      x: ((i * 7) % 16) - 8,
      y: ((i * 23) % 20) - 10,
      rotate: ((i * 17) % 5) - 2,
      dealX: ((i * 100) % 1000) - 500,
      dealRotate: ((i * 50) % 90) - 45,
    }));
  }, [profiles]);

  const messyValues = useMemo(() => {
    return profiles.map((_, i) => ({
      messyRotate: ((i * 17) % 5) - 2,
      messyY: ((i * 23) % 10) - 5,
    }));
  }, [profiles]);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage('dealing'), 800);
    const timer2 = setTimeout(() => setAnimationStage('carousel'), 1600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleCardClick = (index: number) => {
    if (animationStage !== 'carousel') return;
    setActiveIndex(index);
  };

  const goToPrev = () => {
    setActiveIndex((activeIndex - 1 + TOTAL) % TOTAL);
  };

  const goToNext = () => {
    setActiveIndex((activeIndex + 1) % TOTAL);
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    if (animationStage === 'stack') {
      const offsets = cardOffsets[index];
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -160,
        marginLeft: -110,
        transform: `translate(${offsets.x + 60}px, ${offsets.y}px) rotate(${offsets.rotate}deg)`,
        zIndex: TOTAL - index,
        transition: "all 0.5s cubic-bezier(.34,1.56,.64,1)",
      };
    }

    if (animationStage === 'dealing') {
      const offsets = cardOffsets[index];
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -160,
        marginLeft: -110,
        transform: `translate(${offsets.dealX}px) translateY(1000px) scale(0.5) rotate(${offsets.dealRotate}deg)`,
        zIndex: 0,
        opacity: 0,
        transition: "all 0.8s ease-in",
      };
    }

    // Carousel
    let offset = (index - activeIndex) % TOTAL;
    if (offset < 0) offset += TOTAL;
    if (offset > TOTAL / 2) offset -= TOTAL;
    
    const absOffset = Math.abs(offset);
    const isVisible = absOffset <= 2;

    const xOffset = offset * 140 + 140;
    const scale = 1 - absOffset * 0.1;
    const zIndex = 100 - absOffset;
    const rotate = offset * 3;

    const messy = messyValues[index];

    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -160,
      marginLeft: -110,
      transform: `translate(${xOffset - 50 + messy.messyY}px, ${messy.messyY}px) scale(${scale}) rotate(${rotate + messy.messyRotate}deg)`,
      zIndex,
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' as const : 'none' as const,
      transition: "all 0.44s cubic-bezier(.34,1.56,.64,1)",
    };
  };

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, overflow: "hidden" }}>
      <GlobalStyles />
      <Texture />

      {/* Header */}
      <div style={{ 
        padding: "20px 32px", 
        background: DS.card, 
        borderBottom: DS.border,
        display: "flex", 
        alignItems: "center", 
        gap: 16,
        position: "relative",
        zIndex: 200,
        opacity: animationStage === 'carousel' ? 1 : 0,
        transition: "opacity 0.3s"
      }}>
        <button 
          onClick={() => window.location.href = '/admindash'}
          style={{
            padding: "8px 16px",
            borderRadius: DS.radius.md,
            border: DS.border,
            background: DS.ink,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13
          }}
        >
          ← Back
        </button>
        <h1 className="b t-h1" style={{ color: DS.ink }}>Choose Profile</h1>
      </div>

      {/* Cards Container */}
      <div style={{ 
        position: "relative", 
        height: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {profiles.map((profile, index) => (
          <div 
            key={profile.id}
            style={getCardStyle(index)}
          >
            <ProfileCard 
              profile={profile} 
              onClick={() => handleCardClick(index)}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {animationStage === 'carousel' && (
        <div style={{
          position: "fixed",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 20,
          zIndex: 300,
        }}>
          <button 
            onClick={goToPrev}
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              border: DS.border,
              background: DS.ink,
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ←
          </button>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 20px",
            background: DS.card,
            border: DS.border,
            borderRadius: 30
          }}>
            {profiles.map((_, i) => (
              <div 
                key={i}
                onClick={() => setActiveIndex(i)}
                style={{
                  width: i === activeIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === activeIndex ? DS.ink : "#ddd",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              />
            ))}
          </div>
          <button 
            onClick={goToNext}
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              border: DS.border,
              background: DS.ink,
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default TempGridView;
