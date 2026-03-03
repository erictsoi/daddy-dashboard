import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChildProfile } from '../types';
import { DS, Shadow } from '../components/design-system';
import { toKidDash, toAdminDash, toLanding } from '../lib/routes';
import { useAppContext } from '../context/AppContext';
import { DEMO_PROFILES } from '../data/demoProfiles';

// Constants
const CARD_WIDTH = 220;
const CARD_HEIGHT = 320;
const CARD_MARGIN_TOP = -CARD_HEIGHT / 2;
const CARD_MARGIN_LEFT = -CARD_WIDTH / 2;
const DELAY_REVEAL = 800;
const BOUNCE_INTERVAL = 700;
const BOUNCE_DELAY_START = 600;
const NAVIGATE_TIMEOUT = 1500;
const FILLER_COUNT = 6;
const FILLER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

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
  finalRotation?: number;
  zIndex?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected?: boolean;
  isOtherSelected?: boolean;
  isRevealed?: boolean;
  isBouncing?: boolean;
  isHoverBouncing?: boolean;
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
  finalRotation = 0,
  zIndex,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isSelected,
  isOtherSelected,
  isRevealed,
  isBouncing = false,
  isHoverBouncing = false,
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
          x: initialOffset.x + (Math.sin(parseInt(id.split('-')[1]) || 0) * 100),
          y: 600,
          rotate: initialOffset.rotation + 45,
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
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          background: color,
          border: '2.5px solid #1A1A2E',
          borderRadius: 16,
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: CARD_MARGIN_TOP,
          marginLeft: CARD_MARGIN_LEFT,
          boxShadow: '3px 3px #3D2B1F',
        }}
      />
    );
  }

  return (
    <motion.button
      className=""
      initial={{
        x: initialOffset.x,
        y: initialOffset.y,
        rotate: initialOffset.rotation,
        scale: 1,
        opacity: 1,
      }}
      animate={isRevealed ? {
        x: isSelected ? 0 : finalX,
        y: isSelected ? 0 : isHoverBouncing ? finalY - 16 : isBouncing ? finalY - 14 : finalY,
        rotate: isSelected ? 0 : (finalRotation ?? 0),
        scale: isSelected ? 1.5 : isOtherSelected ? 0.8 : 1,
        opacity: isOtherSelected ? 0 : 1,
      } : {
        x: initialOffset.x,
        y: initialOffset.y,
        rotate: initialOffset.rotation,
        scale: 1,
        opacity: 1,
      }}
      transition={isSelected ? {
        type: 'tween',
        duration: 0.4,
        ease: "easeOut",
      } : isHoverBouncing ? {
        y: { repeat: Infinity, repeatType: 'reverse', duration: 0.35, ease: 'easeInOut' },
        default: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
      } : isBouncing ? {
        duration: 0.35,
        ease: [0.34, 1.56, 0.64, 1],
      } : {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileTap={{ scale: isSelected ? 1.4 : 0.95 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: CARD_MARGIN_TOP,
        marginLeft: CARD_MARGIN_LEFT,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
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
                src={isAdmin ? "/profile-pics/Admin.jpg" : (image || `/profile-pics/${id}.jpg`)}
                alt={name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
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
  finalRotation?: number;
  zIndex?: number;
  age?: string;
  interests?: string[];
  image?: string;
}

export const ReturningView: React.FC = () => {
  const { children: contextChildren, user, loading, settings } = useAppContext();
  const navigate = useNavigate();

  const onNavigate = (view: { type: 'LANDING' } | { type: 'KIDSDASH'; childId: string } | { type: 'ADMIN' } | { type: 'HOME' }) => {
    if (view.type === 'KIDSDASH' && 'childId' in view) navigate(toKidDash(view.childId));
    else if (view.type === 'ADMIN' || view.type === 'HOME') navigate(toAdminDash());
    else if (view.type === 'LANDING') navigate(toLanding());
  };
  const [phase, setPhase] = useState<'stack' | 'reveal'>('stack');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  const [bouncingIndex, setBouncingIndex] = useState<number>(-1);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const PROFILES = useMemo(() => {
    const adminProfile = { id: "admin", name: settings.adminName || "Daddy", year: "Admin", age: "", color: settings.adminColor || "#1A1A2E", tint: "#E8E8E8", emoji: settings.adminAvatar || "👨", image: undefined, interests: ["Dashboard", "Settings"], isAdmin: true };
    const kids = (user && contextChildren && contextChildren.length > 0) ? contextChildren : DEMO_PROFILES;
    return [
      adminProfile,
      ...kids.map(child => ({
        id: child.id,
        name: child.name,
        year: child.year || 'N/A',
        age: child.age,
        color: child.color || '#95A5A6',
        tint: child.tint || '',
        emoji: child.emoji || '❓',
        image: child.image,
        interests: child.interests || [],
        isAdmin: false,
      }))
    ];
  }, [contextChildren, user, settings]);

  const FILLERS = useMemo(() => Array.from({ length: FILLER_COUNT }, (_, i) => ({
    id: `filler-${i}`,
    name: '',
    year: '',
    emoji: '',
    color: FILLER_COLORS[i % FILLER_COLORS.length],
    tint: '',
    isFiller: true,
    initialOffset: {
      x: (Math.sin(i * 1.5) * 8),
      y: (Math.cos(i * 1.5) * 8),
      rotation: (Math.sin(i * 3) * 3),
    },
  })), []);

  const MARGIN = 40;
  const availableWidth = windowWidth - MARGIN * 2;
  const GAP = useMemo(() => Math.min(20, (availableWidth - CARD_WIDTH * PROFILES.length) / Math.max(1, PROFILES.length - 1)), [availableWidth, PROFILES.length]);
  const totalWidth = PROFILES.length * CARD_WIDTH + (PROFILES.length - 1) * GAP;
  const startX = -totalWidth / 2 + CARD_WIDTH / 2;

  // Pre-compute stable jitter values so they don't change on re-render.
  const JITTER = useMemo(() => PROFILES.map((_, i) => ({
    finalYOffset: ((i + 1) % 2 === 0 ? 1 : -1) * (2 + (Math.abs(Math.sin(i)) * 6)),
    finalRotation: (i % 2 === 0 ? 1 : -1) * (0.5 + (Math.abs(Math.cos(i)) * 2)),
    initX: (Math.sin(i * 1.2) * 6),
    initY: (Math.cos(i * 1.2) * 6),
    initRot: (Math.sin(i * 2.5) * 2),
  })), [PROFILES.length]);

  const cards = useMemo(() => PROFILES.map((profile, index) => ({
    ...profile,
    isFiller: false,
    initialOffset: {
      x: JITTER[index]?.initX || 0,
      y: JITTER[index]?.initY || 0,
      rotation: JITTER[index]?.initRot || 0,
    },
    finalX: startX + index * (CARD_WIDTH + GAP),
    finalY: JITTER[index]?.finalYOffset || 0,
    finalRotation: JITTER[index]?.finalRotation || 0,
    zIndex: PROFILES.length - index,
  })), [PROFILES, JITTER, startX, GAP]);

  const allCards = useMemo(() => [...FILLERS.map(f => ({
    ...f,
    color: f.color,
    tint: '',
    year: '',
    name: '',
    emoji: '',
  })), ...cards], [FILLERS, cards]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('reveal');
    }, DELAY_REVEAL);
    return () => clearTimeout(timer);
  }, []);

  // Sequential bounce: after reveal starts, cycle through each card
  useEffect(() => {
    if (phase !== 'reveal' || selectedId) return;
    // Start after cards have settled
    const startDelay = setTimeout(() => {
      setBouncingIndex(0);
    }, BOUNCE_DELAY_START);
    return () => clearTimeout(startDelay);
  }, [phase, selectedId]);

  useEffect(() => {
    // Pause sequential advance while a card is hovered
    if (bouncingIndex < 0 || selectedId || hoveredIndex >= 0) return;
    const numCards = cards.length;
    const timer = setTimeout(() => {
      setBouncingIndex(prev => (prev + 1) % numCards);
    }, BOUNCE_INTERVAL);
    return () => clearTimeout(timer);
  }, [bouncingIndex, selectedId, hoveredIndex, cards.length]);

  const handleCardClick = useCallback((card: typeof cards[0]) => {
    if (navigating) return;
    setSelectedId(card.id);
    setNavigating(true);
    setHoveredIndex(-1);
    setBouncingIndex(-1);

    setTimeout(() => {
      if (card.isAdmin) {
        onNavigate({ type: 'ADMIN' });
      } else {
        onNavigate({ type: 'KIDSDASH', childId: card.id });
      }
    }, NAVIGATE_TIMEOUT);
  }, [navigating, onNavigate]);

  const handleMouseEnter = useCallback((id: string) => {
    if (phase !== 'reveal' || selectedId) return;
    const idx = cards.findIndex(c => c.id === id);
    setHoveredIndex(idx);
  }, [phase, selectedId, cards]);

  const handleMouseLeave = useCallback((id: string) => {
    if (phase !== 'reveal' || selectedId) return;
    const idx = cards.findIndex(c => c.id === id);
    setBouncingIndex(idx);
    setHoveredIndex(-1);
  }, [phase, selectedId, cards]);

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
            onClick={() => onNavigate({ type: 'LANDING' })}
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
            onClick={() => onNavigate({ type: 'ADMIN' })}
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 40px' }}>
          {allCards.map((card, index) => (
            <ProfileCard
              key={card.id || index}
              {...card}
              onClick={!card.isFiller && phase === 'reveal' ? () => handleCardClick(card as any) : undefined}
              onMouseEnter={!card.isFiller ? () => handleMouseEnter(card.id) : undefined}
              onMouseLeave={!card.isFiller ? () => handleMouseLeave(card.id) : undefined}
              isSelected={selectedId === card.id}
              isOtherSelected={selectedId !== null && selectedId !== card.id && !card.isFiller}
              isRevealed={phase === 'reveal'}
              isBouncing={!card.isFiller && !selectedId && hoveredIndex < 0 && bouncingIndex === cards.findIndex(c => c.id === card.id)}
              isHoverBouncing={!card.isFiller && !selectedId && hoveredIndex === cards.findIndex(c => c.id === card.id)}
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
                Already have an account? <span style={{ color: DS.ink, cursor: "pointer", textDecoration: "underline" }} onClick={() => onNavigate({ type: 'LANDING' })}>Sign in here</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
