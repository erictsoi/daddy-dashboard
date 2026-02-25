import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChildProfile } from '../types';
import { DS } from '../components/design-system';
import { getDummyProfiles } from '../src/data/dummyData';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { font-family: 'Nunito Sans', sans-serif; background: #FAF6F0; color: #1A1A2E; }
    .b  { font-family: 'Baloo 2', cursive; }
    .n  { font-family: 'Nunito', sans-serif; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    .bounce-card { animation: bounce 0.75s ease-in-out infinite; }
    .card-shadow {
      position: absolute;
      top: 5px;
      left: 5px;
      right: -5px;
      bottom: -5px;
      z-index: -1;
      pointer-events: none;
      background-image: radial-gradient(circle, #3D2B1F 2.5px, transparent 2.5px);
      background-size: 5.5px 5.5px;
      border-radius: 16px;
      opacity: 0.35;
    }
  `}</style>
);
const BendayShadow = ({ offset = 3, size = 3, scale = 1 }: { offset?: number; size?: number; scale?: number }) => (
  <div style={{
    position: "absolute",
    top: offset / scale,
    left: offset / scale,
    right: -offset / scale,
    bottom: -offset / scale,
    zIndex: -1, pointerEvents: "none",
    backgroundImage: `radial-gradient(circle, #3D2B1F ${size / scale}px, transparent ${size / scale}px)`,
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

interface CardProps {
  id: string;
  name: string;
  year: string;
  emoji: string;
  color: string;
  tint: string;
  age?: string;
  interests?: string[];
  image?: string;
  isAdmin?: boolean;
  isFiller?: boolean;
  initialOffset: { x: number; y: number; rotation: number };
  finalX?: number;
  finalY?: number;
  zIndex?: number;
  onClick?: () => void;
  isSelected?: boolean;
  isOtherSelected?: boolean;
  isRevealed?: boolean;
}

const ProfileCard: React.FC<CardProps> = ({
  id,
  name,
  year,
  emoji,
  color,
  tint,
  age,
  interests,
  image,
  isAdmin,
  isFiller,
  initialOffset,
  finalX = 0,
  finalY = 0,
  zIndex,
  onClick,
  isSelected,
  isOtherSelected,
  isRevealed,
}) => {
  if (isFiller) {
    return (
      <motion.div
        initial={{
          x: initialOffset.x,
          y: initialOffset.y,
          rotate: initialOffset.rotation,
          opacity: 1,
        }}
        animate={isRevealed ? {
          x: (Math.random() - 0.5) * 100,
          y: 400,
          rotate: initialOffset.rotation + (Math.random() * 30 - 15),
          opacity: 0,
        } : {
          x: initialOffset.x,
          y: initialOffset.y,
          rotate: initialOffset.rotation,
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          ease: "easeIn",
        }}
        style={{
          width: 220,
          height: 320,
          background: color,
          border: '2.5px solid #1A1A2E',
          borderRadius: 16,
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -160,
          marginLeft: -110,
          boxShadow: '3px 3px #3D2B1F',
        }}
      />
    );
  }

  return (
    <motion.button
      className={isSelected ? "bounce-card" : ""}
      initial={{
        x: initialOffset.x,
        y: initialOffset.y,
        rotate: initialOffset.rotation,
        scale: 1,
        opacity: 1,
      }}
      animate={isRevealed ? {
        x: isSelected ? 0 : finalX,
        y: isSelected ? finalY : finalY,
        rotate: isSelected ? 0 : 0,
        scale: isSelected ? 1.5 : isOtherSelected ? 0.8 : 1,
        opacity: isOtherSelected ? 0 : 1,
      } : {
        x: initialOffset.x,
        y: initialOffset.y,
        rotate: initialOffset.rotation,
        scale: 1,
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileTap={{ scale: isSelected ? 1.4 : 0.95 }}
      whileHover={!isSelected && !isOtherSelected && isRevealed ? {
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -160,
        marginLeft: -110,
        transform: 'translate(-50%, -50%)',
        width: 220,
        height: 320,
        cursor: 'pointer',
        zIndex: isSelected ? 100 : (zIndex || 10),
        background: 'none',
        border: 'none',
        padding: 0,
        display: "block",
        outline: "none",
        boxShadow: "none"
      }}
    >
      <Shadow
        scale={isSelected ? 1.5 : 1}
        offset={4}
        size={3}
        radius={16}
        style={{ width: "100%", height: "100%" }}
      >
        <div style={{
          width: "100%",
          height: "100%",
          background: color,
          border: '2.5px solid #1A1A2E',
          borderRadius: 16,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "visible"
        }}>
          {/* Inner white card with black border */}
          <div style={{
            width: "100%",
            height: "100%",
            background: "white",
            borderRadius: 8,
            border: "3px solid black",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Name and Year at top */}
            <div style={{
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              flexShrink: 0
            }}>
              <span style={{
                fontSize: 14,
                fontWeight: 900,
                fontFamily: "Baloo 2, cursive, sans-serif",
                color: color,
                textTransform: "uppercase",
                letterSpacing: 1,
                textShadow: `0.5px 0 ${color}, -0.5px 0 ${color}, 0 0.5px ${color}, 0 -0.5px ${color}`
              }}>
                {name}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#333"
              }}>
                {year}
              </span>
            </div>

            {/* Image with border */}
            <div style={{
              width: 170,
              height: 180,
              margin: "0 auto",
              border: "3px solid black",
              borderRadius: 4,
              overflow: "hidden",
              background: "white",
              flexShrink: 0
            }}>
              <img
                src={isAdmin ? undefined : (image || `/profile-pics/${id}.jpg`)}
                alt={name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: id === 'admin' ? 'none' : 'block'
                }}
              />
            </div>

            {/* Metadata */}
            <div style={{
              margin: "0 0 6px 0",
              background: "white",
              padding: "8px",
              textAlign: "left"
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 3, fontFamily: "'Nunito', sans-serif" }}>
                Age: {age || '5-16'}
              </div>
              <div style={{ fontSize: 12, fontFamily: "'Nunito', sans-serif", color: "#666", lineHeight: 1.3 }}>
                {isAdmin ? 'Dashboard & Admin' : (interests?.join(" · ") || 'Student Access')}
              </div>
            </div>
          </div>
        </div>
      </Shadow>
    </motion.button>
  );
};

interface CardItem {
  id: string;
  name: string;
  year: string;
  emoji: string;
  color: string;
  tint: string;
  isAdmin?: boolean;
  isFiller: boolean;
  initialOffset: { x: number; y: number; rotation: number };
  finalX?: number;
  finalY?: number;
  zIndex?: number;
  age?: string;
  interests?: string[];
  image?: string;
}

interface ReturningViewProps {
  childProfile: ChildProfile | null;
  data: ChildProfile[];
  onNavigate: (view: { type: 'LANDING' } | { type: 'KIDSDASH'; childId: string } | { type: 'ADMIN' }) => void;
}

export const ReturningView: React.FC<ReturningViewProps> = ({ childProfile, data, onNavigate }) => {
  const [phase, setPhase] = useState<'stack' | 'reveal'>('stack');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  const DEMO_PROFILES = getDummyProfiles();

  const PROFILES = [
    { id: "admin", name: "Daddy", year: "Admin", age: "", color: "#1A1A2E", tint: "#E8E8E8", emoji: "👨", image: undefined, interests: ["Dashboard", "Settings"], isAdmin: true },
    ...DEMO_PROFILES.map(child => ({
      id: child.id,
      name: child.name,
      year: child.year,
      age: child.age,
      color: child.color,
      tint: child.tint,
      emoji: child.emoji,
      image: child.image,
      interests: child.interests,
      isAdmin: false,
    })),
  ];

  const FILLER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  const FILLERS: ({
    id: string;
    name: string;
    year: string;
    emoji: string;
    color: string;
    tint: string;
    isFiller: boolean;
    isAdmin?: boolean;
    initialOffset: { x: number; y: number; rotation: number };
    finalX?: number;
    finalY?: number;
  })[] = Array.from({ length: 6 }, (_, i) => ({
    id: `filler-${i}`,
    name: '',
    year: '',
    emoji: '',
    color: FILLER_COLORS[i],
    tint: '',
    isFiller: true,
    initialOffset: {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      rotation: (Math.random() - 0.5) * 4,
    },
  }));

  const CARD_WIDTH = 220;
  const GAP = -25;
  const totalWidth = PROFILES.length * CARD_WIDTH + (PROFILES.length - 1) * GAP;
  const startX = -totalWidth / 2 + CARD_WIDTH / 2;

  const cards = PROFILES.map((profile, index) => ({
    ...profile,
    isFiller: false,
    initialOffset: {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      rotation: (Math.random() - 0.5) * 4,
    },
    finalX: startX + index * (CARD_WIDTH + GAP),
    finalY: 0,
    zIndex: PROFILES.length - index,
  }));

  const allCards = [...FILLERS.map(f => ({
    ...f,
    color: f.color,
    tint: '',
    year: '',
    name: '',
    emoji: '',
  })), ...cards];

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('reveal');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (card: typeof cards[0]) => {
    if (navigating) return;
    setSelectedId(card.id);
    setNavigating(true);

    setTimeout(() => {
      if (card.isAdmin) {
        window.location.href = '/admindash';
      } else {
        window.location.href = '/kiddash?child=' + card.id;
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: DS.cream,
      position: "relative",
      overflow: "hidden",
    }}>
      <GlobalStyles />
      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedId ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 40px",
          borderBottom: DS.border,
          background: `${DS.card}F0`,
          backdropFilter: "blur(14px)",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            position: "relative",
            width: 40,
            height: 40,
            background: "#1A1A2E",
            border: DS.border,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            boxShadow: "3px 3px #3D2B1F",
          }}>🎓</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: DS.ink }}>DADDY DASHBOARD</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <button
            onClick={() => window.location.href = '/landingview'}
            style={{
              color: DS.inkSoft,
              cursor: "pointer",
              fontWeight: 700,
              background: "none",
              border: "none",
            }}
          >
            Landing
          </button>
          <button
            onClick={() => window.location.href = '/admindash'}
            style={{
              color: DS.ink,
              cursor: "pointer",
              fontWeight: 700,
              background: "none",
              border: "none",
            }}
          >
            Dashboard
          </button>
        </div>
      </motion.nav>

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 40px 24px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>

        {/* Headers - matching LandingView position */}
        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedId ? 0 : 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                textAlign: 'center',
                padding: "20px 0",
              }}
            >
              <div style={{ display: "inline-block", transform: "rotate(-2deg)" }}>
                <Shadow offset={5} size={3} radius={DS.radius.lg}>
                  <div style={{ position: "relative", background: "#1A1A2E", border: DS.border, borderRadius: DS.radius.lg, padding: "8px 32px" }}>
                    <span style={{
                      fontFamily: "'Baloo 2', cursive",
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}>
                      Who is learning today?
                    </span>
                  </div>
                </Shadow>
              </div>
              <p style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: 18,
                fontWeight: 700,
                color: DS.ink,
                marginTop: 20,
              }}>
                Pick a card to take you to your dashboard
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards Container */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {allCards.map((card: CardItem) => (
            <ProfileCard
              key={card.id}
              id={card.id}
              name={card.name}
              year={card.year}
              emoji={card.emoji}
              color={card.color}
              tint={card.tint}
              age={card.age}
              interests={card.interests}
              image={card.image}
              isAdmin={card.isAdmin}
              isFiller={card.isFiller}
              initialOffset={card.initialOffset}
              finalX={card.finalX}
              finalY={card.finalY}
              zIndex={card.zIndex}
              onClick={!card.isFiller && phase === 'reveal' ? () => handleCardClick(card as typeof cards[0]) : undefined}
              isSelected={selectedId === card.id}
              isOtherSelected={selectedId !== null && selectedId !== card.id && !card.isFiller}
              isRevealed={phase === 'reveal'}
            />
          ))}
        </div>

        {/* Footer */}
        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedId ? 0 : 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              style={{
                position: 'absolute',
                bottom: 80,
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: 50,
              }}
            >
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: DS.inkFade, marginTop: 4 }}>
                Already have an account? <span style={{ color: DS.ink, cursor: "pointer", textDecoration: "underline" }} onClick={() => window.location.href = '/landingview'}>Sign in here</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
