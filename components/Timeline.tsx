import React, { useState, useEffect, useMemo } from 'react';
import { ScheduleBlock, ChildProfile } from '../types';
import { Pencil } from 'lucide-react';
import { DS, getThemeColor } from './design-system';

interface Props {
  schedule: ScheduleBlock[];
  onBlockClick: (childId: string, subjectId: string, topicId: string, lessonId: string, blockIndex: number) => void;
  focusedChildId?: string;
  childProfiles?: ChildProfile[];
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getChildDisplay = (childId: string, children: ChildProfile[]) => {
  const child = children.find(c => c.id === childId);
  return {
    name: child?.name || childId,
    avatar: child?.avatar || '👤',
    color: child?.themeColor || 'blue'
  };
};

export const Timeline: React.FC<Props> = ({ schedule, onBlockClick, focusedChildId, childProfiles = [] }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const allChildren = useMemo(() => {
    return focusedChildId 
      ? childProfiles.filter(c => c.id === focusedChildId)
      : childProfiles;
  }, [focusedChildId, childProfiles]);

  if (allChildren.length === 0) {
    return (
      <div style={{ background: DS.card, borderRadius: DS.radius.lg, border: DS.border, padding: 32, textAlign: "center", color: DS.inkSoft }}>
        Loading schedule...
      </div>
    );
  }

  return (
    <div style={{ background: DS.card, borderRadius: DS.radius.lg, border: DS.border, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", background: DS.cream, borderBottom: DS.border }}>
        <div style={{ padding: 12, textAlign: "center" }}><span className="n" style={{ fontSize: 12, fontWeight: 700, color: DS.inkSoft }}>Time</span></div>
        {allChildren.map((child) => {
          const display = getChildDisplay(child.id, allChildren);
          const colors = getThemeColor(display.color);
          return (
            <div key={child.id} style={{ padding: 12, textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: colors.main }}></div>
              <span style={{ fontSize: 24, marginRight: 8 }}>{display.avatar}</span>
              <span className="b" style={{ color: colors.main }}>{display.name}</span>
            </div>
          );
        })}
      </div>
 
      {/* Body */}
      <div style={{ borderTop: DS.border }}>
        {schedule.map((block, blockIndex) => {
          const isNow = currentTime >= block.startTime && currentTime < block.endTime;
          const isPast = currentTime >= block.endTime;
          const isBreak = block.type === 'break' || block.type === 'lunch';
          const isLunch = block.type === 'lunch';
          const breakDuration = isBreak ? Math.round((block.endTime.getTime() - block.startTime.getTime()) / 60000) : 0;
          const isShortBreak = isBreak && !isLunch && breakDuration <= 10;

          return (
            <div key={block.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", background: isNow ? `${getThemeColor('blue').tint}40` : 'transparent', transition: "background 0.2s" }}>
              {/* Time column - hide for short breaks */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRight: DS.border, padding: isShortBreak ? 0 : 4, background: isNow ? getThemeColor('blue').tint : 'transparent' }}>
                {isShortBreak ? (
                  isNow && <div style={{ width: 8, height: 8, borderRadius: "50%", background: getThemeColor('blue').main }} className="float"></div>
                ) : (
                  <>
                    <span className="n" style={{ fontSize: 10, fontWeight: 700, color: DS.inkSoft }}>{formatTime(block.startTime)}</span>
                    <span className="n" style={{ fontSize: 10, color: DS.inkFade }}>{formatTime(block.endTime)}</span>
                  </>
                )}
              </div>

              {isBreak ? (
                <div style={{ gridColumn: "span 2", padding: isShortBreak ? "8px" : 12, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isShortBreak ? (
                    <span style={{ fontSize: 18, marginRight: 8 }}>☕</span>
                  ) : (
                    <span style={{ fontSize: 18, marginRight: 8 }}>🍽️</span>
                  )}
                  <span className="n" style={{ fontSize: 14, fontWeight: 700, color: "#B45309" }}>{block.label || `${breakDuration} min ${isLunch ? 'Lunch & Free Time' : 'Break'}`}</span>
                </div>
              ) : (
                allChildren.map((child) => {
                  const display = getChildDisplay(child.id, allChildren);
                  const colors = getThemeColor(display.color);
                  const childData = block.children?.[child.id];
                  const isChildNow = isNow && childData?.hasDevice;

                  return (
                    <div 
                      key={child.id}
                      style={{ padding: 12, borderRight: DS.border, position: "relative", background: isPast ? "rgba(0,0,0,0.03)" : isChildNow ? getThemeColor('blue').tint : "transparent", opacity: isPast ? 0.5 : 1, cursor: childData ? "pointer" : "default", transition: "background 0.2s" }}
                      onClick={() => childData && onBlockClick(child.id, childData.subjectId, childData.topicId, childData.lessonId, blockIndex)}
                    >
                      {childData && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: colors.main }}></div>}
                      {childData ? (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                            <span className="b" style={{ fontSize: 14, color: DS.ink }}>{childData.subjectName}</span>
                            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: childData.hasDevice ? "#D1FAE5" : "#F3F4F6", color: childData.hasDevice ? "#047857" : "#6B7280" }}>
                              {childData.hasDevice ? '📱' : '📓'}
                            </span>
                          </div>
                          <span className="n" style={{ fontSize: 12, color: DS.inkSoft, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{childData.lessonTitle}</span>
                        </div>
                      ) : (
                        <span className="n" style={{ fontSize: 12, color: DS.inkFade, fontStyle: "italic" }}>Free</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
