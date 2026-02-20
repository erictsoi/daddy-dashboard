import React from 'react';
import { DS, Shadow, SectionHead, Texture, Deco } from '../components/design-system';
import { INITIAL_DATA } from '../constants';

interface ChildDashboardDemoProps {
  setView: (view: any) => void;
  childId?: string;
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

const CHILD_THEME: Record<string, { color: string; name: string; year: string; avatar: string }> = {
  'amara': { color: "#FF6B6B", name: "Amara", year: "Year 1", avatar: "🦋" },
  'marcus': { color: "#4CAF8A", name: "Marcus", year: "Year 3", avatar: "🦖" },
  'sophia': { color: "#9B6DD6", name: "Sophia", year: "Year 5", avatar: "🎨" },
  'kai': { color: "#F5A623", name: "Kai", year: "Year 7", avatar: "🛹" },
  'adrian': { color: "#2B8ED4", name: "Adrian", year: "Year 9", avatar: "🏀" },
  'rohan': { color: "#E8507A", name: "Rohan", year: "Year 11", avatar: "📸" },
};

export const ChildDashboardDemo: React.FC<ChildDashboardDemoProps> = ({ setView, childId = 'sophia' }) => {
  const childInfo = CHILD_THEME[childId] || CHILD_THEME['sophia'];
  const themeColor = childInfo.color;
  const childName = childInfo.name;
  const childYear = childInfo.year;
  const childAvatar = childInfo.avatar;
  
  // Get subjects for this child
  const childData = INITIAL_DATA.find(c => c.id === childId);
  const childSubjects = childData?.yearGroups.flatMap(yg => yg.subjects).map((s, i) => ({
    icon: ["📐", "📖", "🔬", "🎨", "🎵", "⚽", "🏛️", "🌍", "🎭", "💻", "🗣️", "💛"][i % 12],
    name: s.name,
    topic: s.topics[0]?.name || "Topic",
    progress: Math.floor(Math.random() * 80) + 10,
    total: 15,
    color: s.color || themeColor,
    bgColor: `${s.color || themeColor}20`,
  })) || [];

  // Schedule items for display
  const scheduleItems = childSubjects.slice(0, 6).map((s, i) => ({
    icon: s.icon,
    subject: s.name,
    topic: s.topic,
    status: i < 2 ? "DONE" : i === 2 ? "NOW" : "UP NEXT",
    statusColor: i < 2 ? "#4CAF50" : i === 2 ? "#2196F3" : "#9E9E9E",
    bgColor: i < 2 ? "#E8F5E9" : i === 2 ? "#E3F2FD" : "#F5F5F5",
    isActive: i === 2,
  }));

  return (
    <div style={{ minHeight: "100vh", background: DS.cream, position: "relative", overflow: "hidden" }}>
      <Texture />
      <Deco color={themeColor} />

      {/* Header */}
      <div style={{ 
        background: themeColor, 
        padding: "20px 40px",
        borderBottom: DS.border,
        position: "relative",
        zIndex: 10
      }}>
        {/* Nav Buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {navButtons.map(btn => (
            <button
              key={btn.label}
              onClick={() => setView(btn.view)}
              style={{
                padding: "6px 14px",
                background: btn.label === "Kids" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.5)",
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Shadow offset={3} radius="50%">
              <div style={{ 
                width: 60, 
                height: 60, 
                borderRadius: "50%", 
                background: DS.card,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                border: DS.border
              }}>{childAvatar}</div>
            </Shadow>
            <div>
              <h1 className="b" style={{ color: "#fff", fontSize: 28, margin: 0 }}>Hi, {childName}!</h1>
              <p className="n" style={{ color: "rgba(255,255,255,0.9)", margin: "4px 0 0 0" }}>{childYear} Student</p>
            </div>
          </div>
          <Shadow offset={3} radius={DS.radius.md}>
            <button 
              onClick={() => setView({ type: 'LANDING' })}
              style={{ 
                padding: "12px 24px", 
                background: "rgba(255,255,255,0.2)", 
                color: "#fff", 
                border: "2px solid #fff",
                borderRadius: DS.radius.md,
                cursor: "pointer",
                fontWeight: 800
              }}
            >
              Switch Profile
            </button>
          </Shadow>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 40px", position: "relative", zIndex: 5 }}>
        {/* Today's Schedule */}
        <div style={{ marginBottom: 40 }}>
          <SectionHead label="Today's Learning Adventure" color={themeColor} />
          <div style={{ 
            display: "flex", 
            gap: "16px", 
            overflowX: "auto",
            padding: "4px"
          }}>
            {scheduleItems.map((item, i) => (
              <div key={i} style={{ flexShrink: 0 }}>
              <Shadow offset={item.isActive ? 4 : 3} radius={DS.radius.lg}>
                <div style={{ 
                  minWidth: 200, 
                  background: item.bgColor, 
                  borderRadius: DS.radius.lg, 
                  padding: 20,
                  border: item.isActive ? `3px solid ${item.statusColor}` : `2px solid ${item.statusColor}`,
                  boxShadow: item.isActive ? `0 4px 12px ${item.statusColor}40` : "none"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <span style={{ 
                      background: item.statusColor, 
                      color: "#fff", 
                      padding: "4px 8px", 
                      borderRadius: 4, 
                      fontSize: 11, 
                      fontWeight: 800,
                      fontFamily: "Nunito, sans-serif"
                    }}>{item.status}</span>
                  </div>
                  <h3 className="b" style={{ margin: "0 0 8px 0", color: DS.ink, fontSize: 18 }}>{item.subject}</h3>
                  <p className="n" style={{ margin: 0, color: DS.inkSoft, fontSize: 14 }}>{item.topic}</p>
                  {item.isActive && (
                    <Shadow offset={2} radius={DS.radius.sm} style={{ marginTop: 12 }}>
                      <button 
                        onClick={() => setView({ type: 'LESSON', childId: 'demo', subjectId: 'demo', topicId: 'demo', lessonId: 'demo', origin: 'HOME' })}
                        style={{
                          padding: "8px 16px",
                          background: item.statusColor,
                          color: "#fff",
                          border: DS.border,
                          borderRadius: DS.radius.sm,
                          cursor: "pointer",
                          fontWeight: 800,
                          fontSize: 12,
                          fontFamily: "Nunito, sans-serif"
                        }}
                      >
                        ▶ Continue Lesson
                      </button>
                    </Shadow>
                  )}
                </div>
              </Shadow>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div>
          <SectionHead label="Your Subjects" color={themeColor} />
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: "20px" 
          }}>
            {childSubjects.map((subject, i) => (
              <div key={i}>
              <Shadow offset={3} radius={DS.radius.lg}>
                <div style={{ 
                  background: DS.card, 
                  borderRadius: DS.radius.lg, 
                  padding: 24,
                  border: DS.border,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 32 }}>{subject.icon}</span>
                    <h3 className="b" style={{ margin: 0, fontSize: 20, color: DS.ink }}>{subject.name}</h3>
                  </div>
                  <p className="n" style={{ color: DS.inkSoft, marginBottom: 16, fontSize: 14 }}>Topic: {subject.topic}</p>
                  <div style={{ background: subject.bgColor, height: 8, borderRadius: 4, overflow: "hidden", border: `1px solid ${subject.color}30` }}>
                    <div style={{ width: `${subject.progress}%`, background: subject.color, height: "100%", borderRadius: 4, transition: "width 0.3s ease" }} />
                  </div>
                  <p className="n" style={{ margin: "8px 0 0 0", fontSize: 12, color: DS.inkSoft, fontWeight: 600 }}>{subject.total} lessons complete</p>
                </div>
              </Shadow>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
