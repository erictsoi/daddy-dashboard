import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChildProfile } from '../types';
import { DS } from '../components/design-system';
import { getDummyProfiles } from '../src/data/dummyData';

const Shadow: React.FC<{ children: React.ReactNode; offset?: number; size?: number; radius?: number; style?: React.CSSProperties }> = ({ children, offset = 3, size = 2.5, radius, style = {} }) => (
  <div style={{ position: "relative", borderRadius: radius, ...style }}>
    <div style={{
      position: "absolute", top: offset, left: offset, right: -offset, bottom: -offset,
      zIndex: -1, pointerEvents: "none",
      backgroundImage: `radial-gradient(circle, #3D2B1F ${size}px, transparent ${size}px)`,
      backgroundSize: `${size * 2.2}px ${size * 2.2}px`,
      borderRadius: "inherit", opacity: 0.35,
    }} />
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
  isAdmin?: boolean;
  isFiller?: boolean;
  initialOffset: { x: number; y: number; rotation: number };
  finalX?: number;
  finalY?: number;
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
  isAdmin,
  isFiller,
  initialOffset,
  finalX = 0,
  finalY = 0,
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
          width: 192,
          height: 256,
          background: color,
          border: '2px solid black',
          borderRadius: 16,
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -128,
          marginLeft: -96,
          boxShadow: '4px 4px black',
        }}
      />
    );
  }

  return (
    <motion.button
      initial={{
        x: initialOffset.x,
        y: initialOffset.y,
        rotate: initialOffset.rotation,
        scale: 1,
        opacity: 1,
      }}
      animate={isRevealed ? {
        x: isSelected ? 0 : finalX,
        y: isSelected ? 0 : finalY,
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
      whileHover={!isSelected && !isOtherSelected && isRevealed ? {
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      onClick={onClick}
      style={{
        width: 192,
        height: 256,
        background: color,
        border: '2px solid black',
        borderRadius: 16,
        padding: '24px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: isSelected ? '2px 2px black' : '4px 4px black',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -128,
        marginLeft: -96,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 100 : 10,
      }}
    >
      <div style={{
        background: 'rgba(255,255,255,.3)',
        border: '2px solid rgba(255,255,255,.5)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 48, lineHeight: 1 }}>{emoji}</div>
      </div>
      {year && (
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,.2)',
          border: '2px solid rgba(255,255,255,.5)',
          borderRadius: 20,
          padding: '2px 10px',
          marginBottom: 6,
        }}>
          <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>{year.toUpperCase()}</span>
        </div>
      )}
      <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{name}</div>
      <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>
        {isAdmin ? 'Dashboard & Admin' : 'Student Access'}
      </p>
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
  age?: string;
  interests?: string[];
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

  const CARD_WIDTH = 192;
  const GAP = 24;
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
            isAdmin={card.isAdmin}
            isFiller={card.isFiller}
            initialOffset={card.initialOffset}
            finalX={card.finalX}
            finalY={card.finalY}
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
