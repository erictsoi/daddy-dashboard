import React from 'react';
import { DS } from '../components/design-system';
import { TopicFrequency, Subject } from '../types';

interface SubjectCardProps {
  subject: string;
  subjectData: {
    color: string;
    icon: string;
    topic: string;
    category: string;
    progress: number;
    total: number;
    cards?: Array<{
      focus: string;
      approved: boolean;
    }>;
  };
  frequency: TopicFrequency;
  isCore: boolean;
  isEditable?: boolean;
  onFrequencyChange?: (freq: TopicFrequency) => void;
  onRemove?: () => void;
  onAddTopic?: () => void;
}

const StarRating: React.FC<{ frequency: TopicFrequency; onChange?: (freq: TopicFrequency) => void; editable?: boolean }> = ({ 
  frequency, 
  onChange,
  editable = true 
}) => {
  const levels: TopicFrequency[] = ['low', 'balanced', 'high'];
  const currentIndex = levels.indexOf(frequency);

  const cycleUp = () => {
    if (!onChange) return;
    const next = levels[(currentIndex + 1) % levels.length];
    onChange(next);
  };

  return (
    <div 
      onClick={editable ? cycleUp : undefined}
      style={{ 
        cursor: editable ? 'pointer' : 'default',
        display: 'flex', 
        gap: 2 
      }}
      title={editable ? 'Click to change frequency' : undefined}
    >
      {[0, 1, 2].map((i) => {
        const isActive = i <= currentIndex;
        return (
          <span
            key={i}
            style={{
              fontSize: 14,
              color: isActive ? '#F5A623' : 'rgba(26, 26, 46, 0.12)',
              transition: 'color 0.15s'
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const TopicStack: React.FC<{ 
  cards?: Array<{ focus: string; approved: boolean }>; 
  color: string;
  onAdd?: () => void;
}> = ({ cards = [], color, onAdd }) => {
  const displayCards = cards.slice(0, 3);
  const hasMore = cards.length > 3;

  return (
    <div style={{ position: 'relative', height: 70, marginLeft: 8 }}>
      {displayCards.map((card, ci) => (
        <div
          key={ci}
          style={{
            position: 'absolute',
            left: ci * 14,
            top: ci * 10,
            width: 80,
            height: 54,
            background: card.approved ? color : '#FFF',
            border: `2px solid ${color}`,
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            fontSize: 8,
            color: card.approved ? '#FFF' : color,
            fontWeight: 600,
            boxShadow: `${ci + 1}px ${ci + 1}px 0 rgba(0,0,0,0.12)`,
            zIndex: 10 - ci,
            overflow: 'hidden'
          }}
        >
          <div style={{ fontSize: 10, marginBottom: 2 }}>▶</div>
          <div style={{ textAlign: 'center', lineHeight: 1.1, fontSize: 7 }}>
            {card.focus?.replace(/\s*\(.*?\)\s*/g, '').substring(0, 14)}
          </div>
        </div>
      ))}
      {hasMore && (
        <div
          style={{
            position: 'absolute',
            left: 3 * 14,
            top: 3 * 10,
            width: 40,
            height: 54,
            background: `${color}30`,
            border: `2px dashed ${color}`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: color,
            fontWeight: 700
          }}
        >
          +{cards.length - 3}
        </div>
      )}
      {onAdd && (
        <div
          onClick={onAdd}
          style={{
            position: 'absolute',
            left: (Math.min(cards.length, 3)) * 14 + 4,
            top: (Math.min(cards.length, 3)) * 10,
            width: 36,
            height: 40,
            background: 'transparent',
            border: `2px dashed ${color}60`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: `${color}60`,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Add topic"
        >
          +
        </div>
      )}
    </div>
  );
};

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  subjectData,
  frequency,
  isCore,
  isEditable = false,
  onFrequencyChange,
  onRemove,
  onAddTopic
}) => {
  const { color, icon, topic, category, progress, total, cards = [] } = subjectData;
  const progressPercent = total > 0 ? (progress / total) * 100 : 0;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        border: `2.5px dashed ${color}40`,
        padding: 16,
        background: `${color}08`,
        transition: 'all 0.2s',
        cursor: isEditable ? 'default' : 'pointer'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ 
            width: 36, 
            height: 36, 
            background: `${color}20`, 
            border: `2px solid ${color}`, 
            borderRadius: 10, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 18 
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: DS.ink }}>{subject}</div>
            <div style={{ fontSize: 11, color: DS.inkFade, fontWeight: 500 }}>{topic}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarRating 
            frequency={frequency} 
            onChange={onFrequencyChange}
            editable={isEditable}
          />
          <div style={{
            padding: '2px 8px',
            background: isCore ? `${color}20` : `${color}10`,
            border: `1px solid ${color}40`,
            borderRadius: 4,
            fontSize: 9,
            fontWeight: 700,
            color: color,
            textTransform: 'uppercase'
          }}>
            {isCore ? 'Core' : 'Optional'}
          </div>
        </div>
      </div>

      {/* Topic Stack */}
      <TopicStack cards={cards} color={color} onAdd={isEditable ? onAddTopic : undefined} />

      {/* Progress */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: DS.inkFade, fontWeight: 600 }}>Progress</span>
          <span style={{ fontSize: 10, color: color, fontWeight: 700 }}>{progress}/{total}</span>
        </div>
        <div style={{ height: 6, background: '#EDE8E0', borderRadius: 100, overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${progressPercent}%`, 
              background: color, 
              borderRadius: 100,
              transition: 'width 0.3s'
            }} 
          />
        </div>
      </div>

      {/* Remove button (edit mode) */}
      {isEditable && onRemove && (
        <button
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: 'none',
            background: '#FF444420',
            color: '#FF4444',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            transition: 'opacity 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
          title="Remove subject"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SubjectCard;
