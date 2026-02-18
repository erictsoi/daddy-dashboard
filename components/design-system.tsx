import React from 'react';

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
export const DS = {
  cream:    "#FAF6F0",
  card:     "#FFFFFF",
  ink:      "#1A1A2E",
  inkSoft:  "#6B6580",
  inkFade:  "#B0A8C0",
  border:   "2.5px solid #1A1A2E",
  borderThick: "3px solid #1A1A2E",
  radius:   { sm:10, md:16, lg:22, pill:100 },
};

export const THEME_COLORS: Record<string, { main: string; tint: string }> = {
  blue:   { main: "#2B8ED4", tint: "#EAF4FC" },
  indigo: { main: "#6366F1", tint: "#EEF2FF" },
  rose:   { main: "#F43F5E", tint: "#FFE4E6" },
  emerald: { main: "#10B981", tint: "#D1FAE5" },
  amber:  { main: "#F59E0B", tint: "#FEF3C7" },
  purple: { main: "#8B5CF6", tint: "#EDE9FE" },
  pink:   { main: "#EC4899", tint: "#FCE7F3" },
  teal:   { main: "#14B8A6", tint: "#CCFBF1" },
};

export const getThemeColor = (colorName: string) => THEME_COLORS[colorName] || THEME_COLORS.blue;

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { font-family: 'Nunito Sans', sans-serif; background: #FAF6F0; color: #1A1A2E; }
    .b    { font-family: 'Baloo 2', cursive; }
    .n    { font-family: 'Nunito', sans-serif; }
    .ns   { font-family: 'Nunito Sans', sans-serif; }

    .t-hero  { font-size: 56px; font-weight: 800; line-height: 1.0; }
    .t-h1    { font-size: 32px; font-weight: 800; line-height: 1.15; }
    .t-h2    { font-size: 22px; font-weight: 800; line-height: 1.2; }
    .t-h3    { font-size: 16px; font-weight: 800; line-height: 1.3; }
    .t-body  { font-size: 14px; font-weight: 500; line-height: 1.65; }
    .t-small { font-size: 12px; font-weight: 600; line-height: 1.5; }
    .t-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }

    @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes pop    { from{transform:scale(.88);opacity:0} to{transform:scale(1);opacity:1} }
    @keyframes slide  { from{transform:translateX(24px);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes fadeUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes fadeIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
    @keyframes wiggle { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-2deg)} 75%{transform:rotate(2deg)} }

    .float  { animation: float  3s   ease-in-out infinite; }
    .blink  { animation: blink  2s   ease-in-out infinite; }
    .pop    { animation: pop    .3s  cubic-bezier(.34,1.56,.64,1) forwards; }
    .slide  { animation: slide  .28s ease-out forwards; }
    .fadeUp { animation: fadeUp .32s ease-out forwards; }
    .fadeIn { animation: fadeIn .3s ease-out forwards; }
    .wiggle { animation: wiggle .4s ease-in-out infinite; }
    .wiggle-hover:hover { animation: wiggle .4s ease-in-out infinite; }

    .card-0  { animation: fadeUp .28s .00s ease-out both; }
    .card-1  { animation: fadeUp .28s .03s ease-out both; }
    .card-2  { animation: fadeUp .28s .06s ease-out both; }
    .card-3  { animation: fadeUp .28s .09s ease-out both; }
    .card-4  { animation: fadeUp .28s .12s ease-out both; }
    .card-5  { animation: fadeUp .28s .15s ease-out both; }
    .card-6  { animation: fadeUp .28s .18s ease-out both; }
    .card-7  { animation: fadeUp .28s .21s ease-out both; }

    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #EDE8E0; }
    ::-webkit-scrollbar-thumb { background: #C4BBAF; border-radius: 3px; }
  `}</style>
);

// ─── DESIGN SYSTEM COMPONENTS ─────────────────────────────────────────────────
export const Texture = () => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `radial-gradient(circle, #1A1A2E08 1px, transparent 1px)`,
    backgroundSize: "20px 20px"
  }} />
);

export const Blobs = ({ color }: { color: string }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    <div style={{ position: "absolute", top: "-12%", right: "-4%", width: 380, height: 380, borderRadius: "50%", background: color, opacity: .06, filter: "blur(64px)" }} />
    <div style={{ position: "absolute", bottom: "-5%", left: "-8%", width: 300, height: 300, borderRadius: "50%", background: color, opacity: .04, filter: "blur(52px)" }} />
  </div>
);

export const Deco = ({ color }: { color: string }) => (
  <>
    <Blobs color={color} />
    {[{ t: "⭐", x: 4, y: 7, s: 26 }, { t: "✨", x: 87, y: 9, s: 20 }, { t: "🚀", x: 2, y: 48, s: 22 }, { t: "💫", x: 93, y: 72, s: 18 }, { t: "⭐", x: 47, y: 3, s: 15 }, { t: "🌈", x: 90, y: 46, s: 24 }]
      .map((d, i) => (
        <div key={i} style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, fontSize: d.s, opacity: .14, pointerEvents: "none", zIndex: 0, animation: `float ${2.6 + i * .35}s ease-in-out ${i * .18}s infinite` }}>{d.t}</div>
      ))}
  </>
);

export const SolidShadow = ({ offset = 4, color = "#2D2D2D", radius }: { offset?: number; color?: string; radius?: string | number }) => (
  <div style={{
    position: "absolute",
    top: offset,
    left: offset,
    right: -offset,
    bottom: -offset,
    zIndex: -1,
    pointerEvents: "none",
    background: color,
    borderRadius: radius || "inherit",
    opacity: 0.25,
  }} />
);

// Flat shadow component - uses CSS box-shadow instead of benday dots
export const FlatShadow = ({ offset = 3 }: { offset?: number }) => (
  <div style={{
    position: "absolute",
    top: offset,
    left: offset,
    right: -offset,
    bottom: -offset,
    zIndex: -1,
    pointerEvents: "none",
    background: "#3D2B1F",
    borderRadius: "inherit",
    opacity: 0.2,
  }} />
);

// Shadow component with flat dark shade (removed benday dots)
export const Shadow = ({ children, offset = 3, size, radius, style = {} }: { children: React.ReactNode; offset?: number; size?: number; radius?: string | number; style?: React.CSSProperties }) => (
  <div style={{ position: "relative", borderRadius: radius, ...style, boxShadow: `${offset * 2}px ${offset * 2}px 0 rgba(45,45,45,0.2)` }}>
    {children}
  </div>
);

export const Tag = ({ label, color, dark = false }: { label: string; color: string; dark?: boolean }) => (
  <Shadow offset={2} size={2} radius={DS.radius.pill} style={{display:"inline-block"}}>
    <div style={{ position: "relative", background: dark ? DS.ink : color, border: DS.border, borderRadius: DS.radius.pill, padding: "3px 13px" }}>
      <span className="n t-label" style={{ color: "#fff" }}>{label}</span>
    </div>
  </Shadow>
);

export const Chip = ({ icon, val, label, color }: { icon: string; val: string | number; label: string; color: string }) => (
  <Shadow offset={3} size={2.5} radius={DS.radius.md}>
    <div style={{ position: "relative", background: DS.card, border: DS.border, borderRadius: DS.radius.md, padding: "10px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
      <div className="b t-h3" style={{ color }}>{val}</div>
      <div className="n t-label" style={{ color: DS.inkFade }}>{label}</div>
    </div>
  </Shadow>
);

export const SectionHead = ({ label, color }: { label: string; color: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
    <Shadow offset={2} size={2} radius={DS.radius.sm} style={{display:"inline-block"}}>
      <div style={{ position: "relative", background: color, border: DS.border, borderRadius: DS.radius.sm, padding: "4px 16px" }}>
        <span className="b t-label" style={{ color: "#fff" }}>{label}</span>
      </div>
    </Shadow>
    <div style={{ flex: 1, height: 2, background: `${DS.ink}18`, borderRadius: 100 }} />
  </div>
);

// ─── BUTTONS ───────────────────────────────────────────────────────────────────
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, style, className }: ButtonProps) => {
  const sizeStyles = {
    sm: { padding: "8px 16px", fontSize: 12 },
    md: { padding: "12px 24px", fontSize: 14 },
    lg: { padding: "16px 32px", fontSize: 18 },
  };

  const variantStyles = {
    primary: { background: DS.ink, color: "#fff", border: DS.border },
    secondary: { background: DS.card, color: DS.ink, border: DS.border },
    ghost: { background: "transparent", color: DS.inkSoft, border: "2px solid transparent" },
    danger: { background: "#EF4444", color: "#fff", border: DS.border },
  };

  return (
    <Shadow offset={3} size={2.5} radius={DS.radius.pill} style={{ display: "inline-block", opacity: disabled ? 0.5 : 1 }}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`n ${className || ''}`}
        style={{
          position: "relative",
          ...sizeStyles[size],
          ...variantStyles[variant],
          borderRadius: DS.radius.pill,
          fontWeight: 800,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "transform .2s",
          ...style,
        }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "translate(-2px,-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
      >
        {children}
      </button>
    </Shadow>
  );
};

// ─── ICON BUTTON ──────────────────────────────────────────────────────────────
export const IconButton = ({ children, onClick, size = 40, title }: { children: React.ReactNode; onClick?: () => void; size?: number; title?: string }) => (
  <Shadow offset={2} size={2} radius="50%" style={{ display: "inline-block" }}>
    <button
      onClick={onClick}
      title={title}
      style={{
        position: "relative",
        width: size,
        height: size,
        background: DS.card,
        border: DS.border,
        borderRadius: "50%",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        transition: "transform .15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(-2px,-2px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
    >
      {children}
    </button>
  </Shadow>
);

// ─── CARD ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, color, className, style, onClick }: { children: React.ReactNode; color?: string; className?: string; style?: React.CSSProperties; onClick?: () => void }) => {
  const bgColor = color || DS.cream;
  const isLight = color && color !== DS.cream;
  
  return (
    <Shadow offset={isLight ? 5 : 3} size={3} radius={DS.radius.lg} style={{ ...style, cursor: onClick ? "pointer" : "default" }}>
      <div
        onClick={onClick}
        className={className}
        style={{
          position: "relative",
          background: bgColor,
          border: DS.border,
          borderRadius: DS.radius.lg,
          padding: "20px",
          transition: "all .3s",
        }}
      >
        {children}
      </div>
    </Shadow>
  );
};

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ value, onChange, placeholder, type = "text", style }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; style?: React.CSSProperties }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      flex: 1,
      padding: "12px 16px",
      border: DS.border,
      borderRadius: DS.radius.sm,
      fontSize: 14,
      fontFamily: "Nunito Sans",
      outline: "none",
      background: DS.card,
      color: DS.ink,
      ...style,
    }}
  />
);

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
export const ProgressBar2 = ({ current, total, color, height = 8 }: { current: number; total: number; color?: string; height?: number }) => {
  const percent = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ height, background: `${DS.ink}15`, borderRadius: 100, overflow: "hidden" }}>
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          background: color || DS.ink,
          borderRadius: 100,
          transition: "width .4s ease-out",
        }}
      />
    </div>
  );
};

// ─── MINI CARD (for subject/topic grid) ────────────────────────────────────────
export const MiniCard = ({ 
  children, 
  color, 
  accentColor,
  onClick,
  showCheckbox = false,
  isSelected = false,
  onToggleSelect,
}: { 
  children: React.ReactNode; 
  color?: string; 
  accentColor?: string;
  onClick?: () => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) => (
  <div 
    onClick={onClick}
    style={{
      position: "relative",
      padding: "12px",
      borderRadius: DS.radius.md,
      background: DS.card,
      border: isSelected ? `${DS.border} !important` : `1px solid ${DS.ink}20`,
      boxShadow: "4px 4px 0 rgba(45,45,45,0.1)",
      cursor: onClick ? "pointer" : "default",
      transition: "all .2s",
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = "translate(-2px,-2px)";
        e.currentTarget.style.boxShadow = "6px 6px 0 rgba(45,45,45,0.15)";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "4px 4px 0 rgba(45,45,45,0.1)";
    }}
  >
    {showCheckbox && (
      <div 
        onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          width: 20,
          height: 20,
          borderRadius: 4,
          border: `2px solid ${isSelected ? DS.ink : "#CBD5E1"}`,
          background: isSelected ? DS.ink : DS.card,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        {isSelected && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
      </div>
    )}
    {children}
  </div>
);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
export const NavBar = ({ children, left, right }: { children?: React.ReactNode; left?: React.ReactNode; right?: React.ReactNode }) => (
  <nav style={{ 
    position: "relative", 
    zIndex: 10, 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: "14px 40px", 
    borderBottom: DS.border, 
    background: `${DS.card}F0`, 
    backdropFilter: "blur(14px)" 
  }}>
    {left}
    {children}
    {right}
  </nav>
);

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export const Avatar = ({ emoji, size = 48, color, onClick }: { emoji: string; size?: number; color?: string; onClick?: () => void }) => (
  <Shadow offset={3} size={2.5} radius={size > 60 ? 16 : "50%"} style={{ display: "inline-block" }}>
    <div
      onClick={onClick}
      style={{
        position: "relative",
        width: size,
        height: size,
        background: color || `${DS.ink}10`,
        border: DS.border,
        borderRadius: size > 60 ? 16 : "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        cursor: onClick ? "pointer" : "default",
        transition: "transform .2s",
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = "scale(1)")}
    >
      {emoji}
    </div>
  </Shadow>
);

// ─── DROPDOWN MENU ───────────────────────────────────────────────────────────
export const DropdownMenu = ({ 
  isOpen, 
  onClose, 
  children, 
  align = "right" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
  align?: "left" | "right";
}) => {
  if (!isOpen) return null;
  
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={onClose} />
      <div style={{
        position: "absolute",
        top: "100%",
        right: align === "right" ? 0 : "auto",
        left: align === "left" ? 0 : "auto",
        marginTop: 8,
        minWidth: 200,
        background: DS.card,
        border: DS.border,
        borderRadius: DS.radius.md,
        boxShadow: "8px 8px 0 rgba(45,45,45,0.15)",
        zIndex: 50,
        overflow: "hidden",
      }}>
        {children}
      </div>
    </>
  );
};

export const DropdownItem = ({ children, onClick, danger }: { children: React.ReactNode; onClick?: () => void; danger?: boolean }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      padding: "12px 16px",
      background: "none",
      border: "none",
      textAlign: "left",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 12,
      color: danger ? "#EF4444" : DS.ink,
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "Nunito Sans",
      transition: "background .15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "#FEE2E2" : "#F5F5F5")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
  >
    {children}
  </button>
);
