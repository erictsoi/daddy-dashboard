import React, { useState, useMemo, useCallback, memo } from 'react';
import { Lesson, ChildProfile, Subject } from '../types';
import { ArrowLeft, CheckCircle, BookOpen, Award } from 'lucide-react';
import { DS, Shadow, getThemeColor } from './design-system';

interface Props {
  child: ChildProfile;
  subject: Subject;
  topicId: string;
  lesson: Lesson;
  onBack: () => void;
  onComplete: (lessonId: string, timeSpentSeconds: number) => void;
  onSwitchProfile?: (childId: string) => void;
  allChildren?: { id: string; name: string; avatar: string }[];
}

const YOUTUBE_ID_REGEX = /(?:youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;

const getYouTubeID = (url: string | undefined): string => {
  if (!url) return '';
  const match = url.match(YOUTUBE_ID_REGEX);
  return match ? match[1] : '';
};

const getThemeColors = (themeColor: string) => {
  const colors = getThemeColor(themeColor);
  return {
    bg: colors.main,
    tint: colors.tint,
    text: colors.main,
    text600: 'text-600',
  };
};

const OutcomeItem = memo(({ outcome, dotClass }: { outcome: string; dotClass: string }) => (
  <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
    <div className={`mt-1 min-w-[6px] h-[6px] rounded-full ${dotClass}`} />
    <span className="text-gray-600 text-sm leading-relaxed">{outcome}</span>
  </li>
));
OutcomeItem.displayName = 'OutcomeItem';

const LessonPlayer = memo<Props>(({ child, subject, lesson, onBack, onComplete }) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const videoId = useMemo(() => getYouTubeID(lesson.videoUrl), [lesson.videoUrl]);
  const themeColors = useMemo(() => getThemeColors(child.themeColor), [child.themeColor]);

  const handleFinish = useCallback(() => {
    onComplete(lesson.id, 0);
  }, [onComplete, lesson.id]);

  const handleExit = useCallback(() => {
    onBack();
  }, [onBack]);

  const outcomes = useMemo(() => lesson.outcomes || [], [lesson.outcomes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff', position: 'relative' }}>
      {showCompleteModal && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Shadow offset={6} size={3} radius={DS.radius.lg} style={{ maxWidth: 420, width: '100%' }}>
            <div style={{ position: 'relative', background: DS.card, border: DS.border, borderRadius: DS.radius.lg, padding: 32, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: themeColors.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Award size={40} style={{ color: themeColors.text }} />
              </div>
              <h2 className="b t-h1" style={{ color: DS.ink, marginBottom: 8 }}>Great Job, {child.name}!</h2>
              <p className="ns t-body" style={{ color: DS.inkSoft, marginBottom: 32 }}>Lesson complete!</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Shadow offset={3} size={2} radius={DS.radius.md} style={{ display: 'block' }}>
                  <button
                    onClick={handleFinish}
                    style={{
                      position: 'relative',
                      background: themeColors.bg,
                      border: DS.border,
                      borderRadius: DS.radius.md,
                      padding: '16px 24px',
                      fontWeight: 800,
                      fontSize: 18,
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                    }}
                  >
                    <CheckCircle size={24} /> Finish & Save
                  </button>
                </Shadow>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  style={{
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: DS.radius.md,
                    padding: '16px 24px',
                    fontWeight: 800,
                    fontSize: 16,
                    color: DS.inkSoft,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  I'm still learning
                </button>
              </div>
            </div>
          </Shadow>
        </div>
      )}

      <header style={{ background: themeColors.bg, color: '#fff', padding: 16, boxShadow: '0 4px 0 rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Shadow offset={2} size={2} radius={DS.radius.md} style={{ display: 'inline-block' }}>
          <button 
            onClick={handleExit} 
            style={{ 
              position: 'relative', 
              background: '#fff', 
              border: '2.5px solid #1A1A2E', 
              borderRadius: DS.radius.md, 
              padding: 8, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              color: themeColors.bg,
            }}
          >
            <ArrowLeft size={20} />
            <span className="n" style={{ fontWeight: 800, fontSize: 14 }}>Exit Lesson</span>
          </button>
        </Shadow>
        <div style={{ textAlign: 'center' }}>
          <h1 className="n" style={{ fontSize: 18, fontWeight: 800 }}>{subject.name}</h1>
          <p className="ns" style={{ fontSize: 14, opacity: 0.9 }}>{lesson.title}</p>
        </div>
        <div style={{ width: 100, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: 28 }}>{child.avatar}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 bg-gray-900 flex flex-col justify-center items-center relative p-8">
          <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-4 ring-gray-800">
            {videoId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                Video Unavailable
              </div>
            )}
          </div>
        </main>

        <aside className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
          <div className="p-6 bg-white border-b border-gray-200">
            <span className="text-gray-500 font-medium flex items-center gap-2">
              <BookOpen size={16} /> Lesson
            </span>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {lesson.lessonFocus && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen size={18} className={themeColors.text600} />
                  Lesson Aims
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed p-3 bg-blue-50 rounded-lg border border-blue-100">
                  {lesson.lessonFocus}
                </p>
              </div>
            )}

            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={18} className={themeColors.text600} />
              Learning Outcomes
            </h3>
            <ul className="space-y-3">
              {outcomes.map((outcome, idx) => (
                <OutcomeItem key={idx} outcome={outcome} dotClass={themeColors.text600.replace('text-', 'bg-')} />
              ))}
            </ul>

            {lesson.lessonNotes && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen size={18} className={themeColors.text600} />
                  Notes
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed p-3 bg-amber-50 rounded-lg border border-amber-100">
                  {lesson.lessonNotes}
                </p>
              </div>
            )}
          </div>

          <footer className="p-6 bg-white border-t border-gray-200">
            {lesson.completed ? (
              <div className="w-full py-4 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2">
                <CheckCircle size={24} /> Lesson Completed!
              </div>
            ) : (
              <button
                onClick={() => setShowCompleteModal(true)}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <CheckCircle size={20} /> Mark Complete
              </button>
            )}
          </footer>
        </aside>
      </div>
    </div>
  );
});

LessonPlayer.displayName = 'LessonPlayer';

export { LessonPlayer };
