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
  onClick?: () => void;
  onCardClick?: (card: { focus: string; approved: boolean }) => void;
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
  onCardClick?: (card: { focus: string; approved: boolean }) => void;
}> = ({ cards = [], color, onAdd, onCardClick }) => {
  const displayCards = cards.slice(0, 3);
  const hasMore = cards.length > 3;

  const messyPositions = [
    { left: 5, top: 0, rotate: -3 },
    { left: 22, top: 6, rotate: 4 },
    { left: 0, top: 16, rotate: 5 },
  ];

  return (
    <div style={{ position: 'relative', height: 80, marginLeft: 8 }}>
      {displayCards.map((card, ci) => {
        const pos = messyPositions[ci] || { left: ci * 18, top: ci * 12, rotate: 0 };
        return (
        <div
          key={ci}
          onClick={() => onCardClick?.(card)}
          style={{
            position: 'absolute',
            left: pos.left,
            top: pos.top,
            width: 56,
            height: 78,
            background: card.approved ? color : '#FFF',
            border: `2px solid ${color}`,
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px',
            fontSize: 7,
            color: card.approved ? '#FFF' : color,
            fontWeight: 600,
            boxShadow: `${ci + 1}px ${ci + 1}px 0 rgba(0,0,0,0.12)`,
            zIndex: 10 + ci,
            overflow: 'hidden',
            cursor: 'pointer',
            transform: `rotate(${pos.rotate}deg)`
          }}
        >
          <div style={{ fontSize: 9, marginBottom: 1 }}>▶</div>
          <div style={{ textAlign: 'center', lineHeight: 1.1, fontSize: 6 }}>
            {card.focus?.replace(/\s*\(.*?\)\s*/g, '').substring(0, 12)}
          </div>
        </div>
      );
      })}
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
  onAddTopic,
  onClick,
  onCardClick
}) => {
  const { color, icon, topic, category, progress, total, cards = [] } = subjectData;
  const progressPercent = total > 0 ? (progress / total) * 100 : 0;
  const hasMore = cards.length > 3;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: 16,
        border: `2.5px dashed ${color}40`,
        padding: 16,
        background: `${color}08`,
        transition: 'all 0.2s',
        cursor: isEditable ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column'
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
            {isCore ? 'Core' : 'OPT'}
          </div>
        </div>
      </div>

      {/* Topic Stack */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <TopicStack cards={cards} color={color} onAdd={isEditable ? onAddTopic : undefined} onCardClick={onCardClick} />
        </div>
        {hasMore && (
          <div
            style={{
              width: 32,
              height: 32,
              background: `${color}30`,
              border: `2px dashed ${color}`,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: color,
              fontWeight: 700,
              flexShrink: 0,
              marginTop: 4
            }}
          >
            +{cards.length - 3}
          </div>
        )}
      </div>

      {/* Progress */}
      <div style={{ marginTop: 'auto', paddingTop: 12 }}>
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
