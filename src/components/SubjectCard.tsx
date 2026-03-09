import React, { useState } from 'react';
import { DS } from '../components/design-system';
import { TopicFrequency } from '../types';

const SUBJECT_COLORS: Record<string, { c: string; cs: string; cl: string }> = {
  'English': { c: '#E84848', cs: 'rgba(232,72,72,0.12)', cl: '#fff0f0' },
  'Maths': { c: '#F5A623', cs: 'rgba(245,166,35,0.12)', cl: '#fffbf0' },
  'Science': { c: '#00A8DD', cs: 'rgba(0,168,221,0.12)', cl: '#f0faff' },
  'History': { c: '#C2680A', cs: 'rgba(194,104,10,0.12)', cl: '#fff8f0' },
  'Geography': { c: '#2ECC71', cs: 'rgba(46,204,113,0.12)', cl: '#f0fff8' },
  'Design & Technology': { c: '#1A9BB5', cs: 'rgba(26,155,181,0.12)', cl: '#f0fafd' },
  'Art & Design': { c: '#9B4FD4', cs: 'rgba(155,79,212,0.12)', cl: '#faf0ff' },
  'Music': { c: '#8855EE', cs: 'rgba(136,85,238,0.12)', cl: '#f5f0ff' },
  'PE': { c: '#44AA22', cs: 'rgba(68,170,34,0.12)', cl: '#f0fff0' },
  'Computing': { c: '#3355DD', cs: 'rgba(51,85,221,0.12)', cl: '#f0f3ff' },
  'French': { c: '#FF8822', cs: 'rgba(255,136,34,0.12)', cl: '#fff5f0' },
  'Spanish': { c: '#FF7711', cs: 'rgba(255,119,17,0.12)', cl: '#fff4ee' },
  'German': { c: '#CC5500', cs: 'rgba(204,85,0,0.12)', cl: '#fff2ee' },
};

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
      videoCount?: number;
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

const SPARKLES = ['✨', '⭐', '💫', '🌟', '⚡', '🌸', '🎶', '🌺'];

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
  const [flipped, setFlipped] = useState(false);
  
  const { color, icon, topic, category, progress, total, cards = [] } = subjectData;
  const subjectColor = SUBJECT_COLORS[subject] || { c: color, cs: `${color}1F`, cl: '#fff' };
  const progressPercent = total > 0 ? (progress / total) * 100 : 0;
  const cardCount = cards.length || 1;
  const sparkles = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];

  const handleClick = (e: React.MouseEvent) => {
    if (isEditable) {
      onClick?.();
    } else {
      setFlipped(!flipped);
    }
  };

  const handleCardClick = (e: React.MouseEvent, card: { focus: string; approved: boolean }) => {
    e.stopPropagation();
    onCardClick?.(card);
  };

  const getColorClass = (subject: string) => {
    const map: Record<string, string> = {
      'English': 'dd-c-english',
      'Maths': 'dd-c-maths',
      'Science': 'dd-c-science',
      'History': 'dd-c-history',
      'Geography': 'dd-c-geography',
      'Design & Technology': 'dd-c-dt',
      'Art & Design': 'dd-c-art',
      'Music': 'dd-c-music',
      'PE': 'dd-c-pe',
      'Computing': 'dd-c-computing',
      'French': 'dd-c-french',
      'Spanish': 'dd-c-spanish',
      'German': 'dd-c-german',
    };
    return map[subject] || '';
  };

  return (
    <div 
      className={`dd-card-stack ${getColorClass(subject)} ${flipped ? 'flipped' : ''}`}
      style={{ 
        '--card-color': subjectColor.c,
        '--card-color-soft': subjectColor.cs,
        '--card-color-light': subjectColor.cl,
      } as React.CSSProperties}
      onClick={handleClick}
    >
      <div className="dd-stack-count" style={{ background: subjectColor.c }}>{cardCount} cards</div>
      
      <div className="dd-flip-container">
        {/* Front Face */}
        <div 
          className="dd-card-face"
          style={{ 
            borderColor: `${subjectColor.c}30`,
          }}
        >
          <div 
            className="dd-card-art-area"
            style={{
              background: `linear-gradient(160deg, ${subjectColor.cl} 0%, ${subjectColor.cl.replace('1)', '0.6)')} 100%)`,
            }}
          >
            <span className="dd-art-sparkles">{sparkles}</span>
            <div className="dd-kawaii-placeholder">{icon}</div>
          </div>
          
          <div 
            className="dd-card-front-footer"
            style={{
              background: `linear-gradient(135deg, ${subjectColor.c} 0%, ${subjectColor.c}BF 100%)`,
            }}
          >
            <span className="dd-front-subject-name">{subject}</span>
            <span className="dd-front-badge" style={{ background: isCore ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)', borderColor: isCore ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)' }}>
              {isCore ? 'Core' : 'Opt'}
            </span>
          </div>
          
          <div className="dd-front-progress">
            <div className="dd-front-prog-label">
              <span>Progress</span>
              <span style={{ color: subjectColor.c }}>{progress} / {total}</span>
            </div>
            <div className="dd-front-prog-bar" style={{ background: subjectColor.cs }}>
              <div className="dd-front-prog-fill" style={{ width: `${progressPercent}%`, background: subjectColor.c }} />
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div 
          className="dd-card-face dd-card-back"
          style={{ 
            borderColor: `${subjectColor.c}30`,
          }}
        >
          <div 
            className="dd-card-banner"
            style={{
              background: `linear-gradient(135deg, ${subjectColor.c} 0%, ${subjectColor.c}BF 100%)`,
            }}
          >
            <div className="dd-subject-icon-wrap">{icon}</div>
            <div className="dd-subject-title-group">
              <div className="dd-subject-name">{subject}</div>
              <div className="dd-subject-topics">{topic}</div>
            </div>
            <span className="dd-subject-badge" style={{ background: isCore ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)', borderColor: isCore ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)' }}>
              {isCore ? 'Core' : 'Opt'}
            </span>
          </div>
          
          <div className="dd-back-close-hint">tap to flip back ↩</div>
          
          <div className="dd-card-body">
            <div className="dd-topic-cards-list">
              {cards.slice(0, 3).map((card, idx) => (
                <div 
                  key={idx} 
                  className="dd-topic-card"
                  style={{ background: subjectColor.cl, border: `1px solid ${subjectColor.c}30` }}
                  onClick={(e) => handleCardClick(e, card)}
                >
                  <span className="dd-topic-num" style={{ color: subjectColor.c }}>{String(idx + 1).padStart(2, '0')}</span>
                  <div className="dd-topic-play" style={{ background: subjectColor.c }}>▶</div>
                  <span className="dd-topic-name">{card.focus}</span>
                  <span className="dd-topic-count" style={{ color: subjectColor.c }}>{card.videoCount || 0} vids</span>
                </div>
              ))}
            </div>
            
            {cards.length > 3 && (
              <div 
                className="dd-more-topics"
                style={{ borderColor: `${subjectColor.c}30`, color: subjectColor.c }}
              >
                ＋ {cards.length - 3} more playlists
              </div>
            )}
            
            <div className="dd-card-progress">
              <div className="dd-progress-header">
                <span className="dd-progress-label">Progress</span>
                <span className="dd-progress-count" style={{ color: subjectColor.c }}>{progress} / {total}</span>
              </div>
              <div className="dd-progress-bar" style={{ background: subjectColor.cs }}>
                <div className="dd-progress-fill" style={{ width: `${progressPercent}%`, background: subjectColor.c }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove button (edit mode) */}
      {isEditable && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
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
            transition: 'opacity 0.15s',
            zIndex: 20
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
          title="Remove subject"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SubjectCard;
