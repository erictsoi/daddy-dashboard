import React, { useState } from 'react';

interface KawaiiSubjectCardProps {
  subject: string;
  icon: string;
  color: string;
  progress: number;
  total: number;
  topicCards: Array<{
    title: string;
    videoCount: number;
    url: string;
    firstVideoId: string;
  }>;
  isCore: boolean;
  onClick?: () => void;
  onCardClick?: (card: { title: string; videoCount: number; url: string; firstVideoId: string }) => void;
}

const SUBJECT_COLOR_CLASSES: Record<string, string> = {
  'English': 'c-english',
  'Maths': 'c-maths',
  'Science': 'c-science',
  'History': 'c-history',
  'Geography': 'c-geography',
  'Design & Technology': 'c-dt',
  'Art & Design': 'c-art',
  'Music': 'c-music',
  'Physical Education': 'c-pe',
  'Computing': 'c-computing',
  'French': 'c-french',
  'Spanish': 'c-spanish',
  'German': 'c-german'
};

const SPARKLES = ['✨', '⭐', '💫', '🌟', '⚡', '🌸', '🎶', '🌺'];

export const KawaiiSubjectCard: React.FC<KawaiiSubjectCardProps> = ({
  subject,
  icon,
  color,
  progress,
  total,
  topicCards,
  isCore,
  onClick,
  onCardClick
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const colorClass = SUBJECT_COLOR_CLASSES[subject] || 'c-english';
  const progressPercentage = total > 0 ? (progress / total) * 100 : 0;
  const sparkle = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
  const displayCards = topicCards.slice(0, 3);
  const remainingCards = topicCards.length - 3;

  const handleCardClick = (card: typeof topicCards[0]) => {
    if (onCardClick) {
      onCardClick({
        title: card.title,
        videoCount: card.videoCount,
        url: card.url,
        firstVideoId: card.firstVideoId
      });
    }
  };

  return (
    <div 
      className={`card-stack ${colorClass}`}
      style={{
        position: 'relative',
        paddingTop: '14px',
        paddingBottom: '6px',
        cursor: 'pointer',
        // CSS variables for dynamic colors
        '--c': color,
        '--cs': `${color}1F`, // 12% opacity
        '--cl': `${color}0A`  // 4% opacity
      } as React.CSSProperties}
      onClick={() => {
        setIsFlipped(!isFlipped);
        if (onClick) onClick();
      }}
    >
      {/* Stack count badge */}
      <div style={{
        position: 'absolute',
        top: '-8px',
        right: '10px',
        zIndex: 10,
        background: color,
        color: '#fff',
        fontSize: '9px',
        fontWeight: 900,
        padding: '2px 8px',
        borderRadius: '100px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        letterSpacing: '0.04em'
      }}>
        {topicCards.length} cards
      </div>

      {/* Flip container */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        {/* Front face */}
        <div style={{
          borderRadius: '16px',
          border: `1.5px solid ${color}4D`,
          boxShadow: '0 4px 20px rgba(26,16,40,0.1)',
          overflow: 'hidden',
          backfaceVisibility: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          position: 'relative'
        }}>
          {/* Card art area */}
          <div style={{
            position: 'relative',
            background: `linear-gradient(160deg, ${color}1F 0%, ${color}0A 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px 14px',
            flexDirection: 'column',
            gap: '10px',
            minHeight: '160px'
          }}>
            {/* Decorative dots pattern */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(circle, ${color}33 1.5px, transparent 1.5px)`,
              backgroundSize: '16px 16px',
              opacity: 0.4
            }} />
            
            {/* Sparkles */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '12px',
              fontSize: '16px',
              opacity: 0.7,
              animation: 'sparkle 2.4s ease-in-out infinite'
            }}>{sparkle}</div>
            
            {/* Kawaii placeholder */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              fontSize: '64px',
              lineHeight: 1,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              userSelect: 'none',
              transform: isFlipped ? 'scale(1)' : 'scale(1)'
            }}>{icon}</div>
          </div>

          {/* Front footer */}
          <div style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <span style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: '14px',
              fontWeight: 800,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>{subject}</span>
            <span style={{
              fontSize: '8px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: '3px 7px',
              borderRadius: '5px',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.25)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              flexShrink: 0
            }}>{isCore ? 'Core' : 'Opt'}</span>
          </div>

          {/* Progress */}
          <div style={{
            padding: '8px 14px 10px',
            background: '#FFFFFF'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              fontWeight: 700,
              color: '#C4BAD0',
              marginBottom: '4px'
            }}>
              <span>Progress</span>
              <span style={{ color }}>{progress} / {total}</span>
            </div>
            <div style={{
              height: '5px',
              background: `${color}1F`,
              borderRadius: '100px',
              overflow: 'hidden',
              marginTop: '4px'
            }}>
              <div style={{
                height: '100%',
                borderRadius: '100px',
                background: color,
                width: `${progressPercentage}%`
              }} />
            </div>
          </div>
        </div>

        {/* Back face */}
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: 'rotateY(180deg)',
          height: '100%',
          borderRadius: '16px',
          border: `1.5px solid ${color}4D`,
          boxShadow: '0 4px 20px rgba(26,16,40,0.1)',
          overflow: 'hidden',
          backfaceVisibility: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF'
        }}>
          {/* Card banner */}
          <div style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
            padding: '10px 12px 8px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <div style={{
              position: 'absolute',
              right: '-18px',
              top: '-18px',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)'
            }} />
            
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
              flexShrink: 0
            }}>{icon}</div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2
              }}>{subject}</div>
              <div style={{
                fontSize: '9px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.72)',
                marginTop: '1px',
                lineHeight: 1.3
              }}>{topicCards.slice(0, 3).map(c => c.title).join(' · ')}</div>
            </div>
            
            <span style={{
              fontSize: '8px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: '2px 6px',
              borderRadius: '5px',
              textTransform: 'uppercase',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.25)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>{isCore ? 'Core' : 'Opt'}</span>
          </div>

          {/* Back close hint */}
          <div style={{
            textAlign: 'center',
            fontSize: '9px',
            fontWeight: 700,
            color: '#C4BAD0',
            padding: '4px 0 2px',
            letterSpacing: '0.04em'
          }}>tap to flip back ↩</div>

          {/* Card body */}
          <div style={{
            padding: '8px 10px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: '#FFFFFF',
            flex: 1,
            overflow: 'hidden'
          }}>
            {/* Topic cards list */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {displayCards.map((card, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(card);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: `${color}0A`,
                    border: `1px solid ${color}30`,
                    borderRadius: '8px',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${color}1F`;
                    e.currentTarget.style.transform = 'translateX(3px)';
                    e.currentTarget.style.boxShadow = `-3px 0 0 ${color}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${color}0A`;
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{
                    fontSize: '8px',
                    fontWeight: 900,
                    color: color,
                    opacity: 0.5,
                    minWidth: '12px'
                  }}>{String(index + 1).padStart(2, '0')}</span>
                  <div style={{
                    width: '15px',
                    height: '15px',
                    borderRadius: '4px',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '6px',
                    color: '#fff',
                    flexShrink: 0
                  }}>▶</div>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#1A1028',
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{card.title}</span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: color,
                    opacity: 0.75,
                    flexShrink: 0
                  }}>{card.videoCount} vids</span>
                </div>
              ))}
            </div>

            {/* More topics pill */}
            {remainingCards > 0 && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '4px',
                  borderRadius: '8px',
                  border: `1.5px dashed ${color}4D`,
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: color,
                  opacity: 0.75,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.75'}
              >
                ＋ {remainingCards} more playlists
              </div>
            )}

            {/* Stars row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: '11px',
                      color: star <= 2 ? color : color,
                      opacity: star <= 2 ? 1 : 0.18
                    }}
                  >★</span>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#C4BAD0',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>Progress</span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: color
                }}>{progress} / {total}</span>
              </div>
              <div style={{
                height: '5px',
                background: `${color}1F`,
                borderRadius: '100px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: '100px',
                  background: color,
                  width: `${progressPercentage}%`,
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ghost cards behind the deck */}
      <div style={{
        position: 'absolute',
        left: '6px',
        right: '6px',
        top: '8px',
        height: 'calc(100% - 8px)',
        borderRadius: '16px',
        border: '1.5px solid rgba(26,16,40,0.1)',
        background: '#FFFFFF',
        transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 2px 12px rgba(26,16,40,0.08)',
        transform: isFlipped ? 'translateY(4px) scale(0.96)' : 'translateY(0) scale(1)',
        opacity: isFlipped ? 0.5 : 1
      }} />
      <div style={{
        position: 'absolute',
        left: '5px',
        right: '5px',
        top: '4px',
        height: 'calc(100% - 8px)',
        borderRadius: '16px',
        border: '1.5px solid rgba(26,16,40,0.1)',
        background: `${color}0A`,
        transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 2px 12px rgba(26,16,40,0.08)',
        transform: isFlipped ? 'translateY(4px) scale(0.96)' : 'translateY(0) scale(1)',
        opacity: isFlipped ? 0.5 : 1
      }} />

      {/* Styles */}
      <style>{`
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.3) rotate(15deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
