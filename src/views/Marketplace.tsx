import React, { useState } from 'react';
import { getSubjectColor } from '../constants';

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
    .t-h3    { font-size: 16px; font-weight: 700; line-height: 1.3; }
    .t-small { font-size: 12px; font-weight: 600; line-height: 1.5; }
    .t-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    @keyframes fadeUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
    .card-0  { animation: fadeUp .28s .00s ease-out both; }
    .card-1  { animation: fadeUp .28s .03s ease-out both; }
    .card-2  { animation: fadeUp .28s .06s ease-out both; }
    .card-3  { animation: fadeUp .28s .09s ease-out both; }
    .card-4  { animation: fadeUp .28s .12s ease-out both; }
    .card-5  { animation: fadeUp .28s .15s ease-out both; }
    .card-6  { animation: fadeUp .28s .18s ease-out both; }
    .card-7  { animation: fadeUp .28s .21s ease-out both; }
    .card-8  { animation: fadeUp .28s .24s ease-out both; }
    .card-9  { animation: fadeUp .28s .27s ease-out both; }
    .card-10 { animation: fadeUp .28s .30s ease-out both; }
    .card-11 { animation: fadeUp .28s .33s ease-out both; }
  `}</style>
);

const Texture = () => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `radial-gradient(circle, #1A1A2E08 1px, transparent 1px)`,
    backgroundSize: "20px 20px"
  }} />
);

const MARKETPLACE_ITEMS = [
  { id: 1, title: "Maths Worksheets Bundle", description: "100+ printable worksheets for Years 1-6", price: "£9.99", category: "Maths", emoji: "📐" },
  { id: 2, title: "Science Experiments Kit", description: "50 hands-on experiments for kids", price: "£14.99", category: "Science", emoji: "🔬" },
  { id: 3, title: "Creative Writing Prompts", description: "200 story starters and writing frames", price: "£7.99", category: "English", emoji: "✏️" },
  { id: 4, title: "History Timeline Cards", description: "Printable timeline of world history", price: "£5.99", category: "History", emoji: "📜" },
  { id: 5, title: "Art & Craft Templates", description: "50 drawing and craft templates", price: "£8.99", category: "Art", emoji: "🎨" },
  { id: 6, title: "Music Theory Basics", description: "Learn to read music with exercises", price: "£11.99", category: "Music", emoji: "🎵" },
];

const CATEGORIES = ["All", "Maths", "Science", "English", "History", "Art", "Music"];

export const Marketplace: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filteredItems = selectedCategory === "All"
    ? MARKETPLACE_ITEMS
    : MARKETPLACE_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, overflow: "auto" }}>
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
        position: "sticky",
        top: 0,
        zIndex: 100
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
        <h1 className="b t-h1" style={{ color: DS.ink }}>Marketplace</h1>
        <span style={{ fontSize: 24 }}>🛒</span>
      </div>

      {/* Categories */}
      <div style={{ padding: "24px 32px", display: "flex", gap: 10, flexWrap: "wrap" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: DS.radius.pill,
              border: selectedCategory === cat ? DS.border : "1.5px solid #C4BBAF",
              background: selectedCategory === cat ? DS.ink : DS.card,
              color: selectedCategory === cat ? "#fff" : DS.inkSoft,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 12,
              transition: "all 0.2s"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div style={{ padding: "0 32px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {filteredItems.map((item, idx) => {
          const itemColor = getSubjectColor(item.category);
          return (
            <div
              key={item.id}
              className={`card-${idx}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: "relative",
                borderRadius: DS.radius.lg,
                cursor: "pointer"
              }}
            >
              <div style={{ position: "relative", borderRadius: DS.radius.lg, transform: hoveredId === item.id ? "translate(-2px, -2px)" : "none", transition: "transform 0.15s ease" }}>
                <div style={{ position: "absolute", top: 2, left: 2, right: -2, bottom: -2, zIndex: -1, pointerEvents: "none", backgroundImage: `radial-gradient(circle, ${DS.dotBrown} 3px, transparent 3px)`, backgroundSize: "6.6px 6.6px", borderRadius: "inherit", opacity: 0.35 }} />
                <div
                  style={{
                    position: "relative",
                    background: DS.card,
                    border: hoveredId === item.id ? `3px solid ${DS.ink}` : "3px solid #C4BBAF",
                    borderRadius: DS.radius.lg,
                    padding: "16px 14px",
                    transition: "border-color 0.15s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, background: `${itemColor}20`, border: `2px solid ${itemColor}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{item.emoji}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div
                        style={{ cursor: "pointer", display: "flex", gap: 1 }}
                      >
                        {[1, 2, 3].map((star) => (
                          <span
                            key={star}
                            style={{
                              fontSize: 14,
                              color: star >= 2 ? "#F5A623" : "transparent"
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div style={{ position: "relative", background: itemColor, border: DS.border, borderRadius: DS.radius.pill, padding: "2px 8px" }}>
                        <span className="n t-label" style={{ color: "#fff" }}>NEW</span>
                      </div>
                    </div>
                  </div>
                  <div className="b t-h3" style={{ color: DS.ink, marginBottom: 2 }}>{item.title}</div>
                  <div className="n t-label" style={{ color: DS.inkSoft, marginBottom: 10, fontWeight: 600 }}>{item.category}</div>
                  <p className="n t-small" style={{ color: DS.inkSoft, marginBottom: 12 }}>{item.description}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="b" style={{ fontSize: 20, color: "#4CAF8A" }}>{item.price}</span>
                    <button
                      style={{
                        padding: "6px 14px",
                        borderRadius: DS.radius.sm,
                        border: DS.border,
                        background: DS.ink,
                        color: "#fff",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: 11
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Marketplace;
