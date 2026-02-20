import React from 'react';
import { DS, Shadow, SectionHead, Texture, Deco, Tag } from '../components/design-system';

interface LessonDemoProps {
  setView: (view: any) => void;
}

const navButtons = [
  { label: "Landing", view: { type: 'LANDING' } },
  { label: "Returning", view: { type: 'RETURNING' } },
  { label: "Admin", view: { type: 'HOME' } },
  { label: "Sophia", view: { type: 'KIDSDASH', childId: 'sophia' } },
  { label: "Adrian", view: { type: 'KIDSDASH', childId: 'adrian' } },
  { label: "Curriculum", view: { type: 'CURRICULUM_BUILDER' } },
  { label: "Lesson", view: { type: 'LESSON', childId: 'sophia', subjectId: 'demo', topicId: 'demo', lessonId: 'demo' } },
];

export const LessonDemo: React.FC<LessonDemoProps> = ({ setView }) => {
  const themeColor = "#2196F3";
  
  const playlist = [
    { title: "What is an Ecosystem?", duration: "7:20", done: true },
    { title: "Producers, Consumers & Decomposers", duration: "9:15", done: true },
    { title: "Food Chains Explained", duration: "11:40", done: false, active: true },
    { title: "Food Webs & Energy Flow", duration: "8:30", done: false },
    { title: "Ecosystems Under Threat", duration: "12:10", done: false },
  ];

  const outcomes = [
    { text: "Understand what a food chain is", done: true },
    { text: "Identify producers, consumers, and decomposers", done: true },
    { text: "Explain energy flow in ecosystems", done: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
      <Texture />
      <Deco color={themeColor} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 40px", position: "relative", zIndex: 5 }}>
        {/* Nav Buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {navButtons.map(btn => (
            <button
              key={btn.label}
              onClick={() => setView(btn.view)}
              style={{
                padding: "6px 14px",
                background: DS.card,
                color: DS.inkSoft,
                border: DS.border,
                borderRadius: DS.radius.sm,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
                fontFamily: "Nunito, sans-serif"
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Shadow offset={3} radius={DS.radius.md}>
            <button 
              onClick={() => setView({ type: 'CHILD_DASHBOARD', childId: 'sophia' })}
              style={{ 
                padding: "10px 20px", 
                background: DS.card, 
                color: DS.ink, 
                border: DS.border, 
                borderRadius: DS.radius.md,
                cursor: "pointer",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif"
              }}
            >
              ← Back
            </button>
          </Shadow>
          <SectionHead label="Demo Lesson View" color={themeColor} />
          <div style={{ width: 100 }} />
        </div>
        
        {/* Lesson Content */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          {/* Video Player Area */}
          <div>
            <Shadow offset={5} radius={DS.radius.lg}>
              <div style={{ 
                background: DS.ink, 
                borderRadius: DS.radius.lg, 
                overflow: "hidden",
                aspectRatio: "16/9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: DS.border
              }}>
                <div style={{ textAlign: "center", color: "white" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>▶️</div>
                  <p className="b" style={{ fontSize: 18 }}>Video Player Demo</p>
                  <p className="n" style={{ fontSize: 14, opacity: 0.7 }}>YouTube embed would appear here</p>
                </div>
              </div>
            </Shadow>
            
            {/* Lesson Info */}
            <Shadow offset={3} radius={DS.radius.lg} style={{ marginTop: 20 }}>
              <div style={{ background: DS.card, borderRadius: DS.radius.lg, padding: 24, border: DS.border }}>
                <h2 className="b" style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: DS.ink }}>
                  Lesson: Food Chains Explained
                </h2>
                <p className="n" style={{ color: DS.inkSoft, marginBottom: 16 }}>
                  Learn about how energy flows through ecosystems and understand the relationships between producers, consumers, and decomposers.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Tag label="Science" color="#1976D2" />
                  <Tag label="Year 5" color="#7B1FA2" />
                  <Tag label="11:40 duration" color="#388E3C" />
                </div>
              </div>
            </Shadow>
            
            {/* Learning Outcomes */}
            <Shadow offset={3} radius={DS.radius.lg} style={{ marginTop: 20 }}>
              <div style={{ background: DS.card, borderRadius: DS.radius.lg, padding: 24, border: DS.border }}>
                <h3 className="b" style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: DS.ink }}>
                  Learning Outcomes
                </h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {outcomes.map((outcome, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ 
                        width: 24, 
                        height: 24, 
                        background: outcome.done ? "#4CAF50" : "#E0E0E0", 
                        borderRadius: "50%", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        color: outcome.done ? "white" : "#666", 
                        fontSize: 14,
                        fontWeight: 800
                      }}>{outcome.done ? "✓" : "○"}</span>
                      <span className="n" style={{ color: outcome.done ? DS.ink : DS.inkFade }}>{outcome.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Shadow>
          </div>
          
          {/* Sidebar - Playlist */}
          <div>
            <Shadow offset={4} radius={DS.radius.lg}>
              <div style={{ background: DS.card, borderRadius: DS.radius.lg, padding: 24, border: DS.border }}>
                <h3 className="b" style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: DS.ink }}>
                  Lesson Playlist
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {playlist.map((item, i) => (
                    <div key={i} style={{ 
                      padding: 16, 
                      background: item.active ? "#FFF3E0" : item.done ? "#E8F5E9" : "#F5F5F5", 
                      borderRadius: DS.radius.md,
                      border: item.active ? `2px solid ${themeColor}` : item.done ? "2px solid #4CAF50" : "2px solid transparent",
                      boxShadow: item.active ? `0 2px 8px ${themeColor}30` : "none"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ 
                          fontSize: 11, 
                          color: item.active ? themeColor : item.done ? "#4CAF50" : "#666", 
                          fontWeight: 800,
                          fontFamily: "Nunito, sans-serif"
                        }}>
                          {i + 1}. {item.done ? "DONE" : item.active ? "NOW PLAYING" : "PENDING"}
                        </span>
                        <span className="n" style={{ fontSize: 12, color: DS.inkFade }}>{item.duration}</span>
                      </div>
                      <p className="b" style={{ fontWeight: 800, color: item.active || item.done ? DS.ink : DS.inkFade, margin: 0 }}>{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Shadow>
            
            {/* Complete Button */}
            <Shadow offset={3} radius={DS.radius.lg} style={{ marginTop: 16 }}>
              <button style={{
                width: "100%",
                padding: 16,
                background: "#4CAF50",
                color: "white",
                border: DS.border,
                borderRadius: DS.radius.lg,
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "Nunito, sans-serif"
              }}>
                ✓ Mark Lesson Complete
              </button>
            </Shadow>
          </div>
        </div>
      </div>
    </div>
  );
};
