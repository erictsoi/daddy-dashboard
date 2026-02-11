import React, { useState, useMemo, useCallback, memo } from 'react';
import { Lesson, ChildProfile, Subject } from '../types';
import { ArrowLeft, CheckCircle, BookOpen, Award } from 'lucide-react';

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

const getThemeColors = (themeColor: string) => ({
  bg: `bg-${themeColor}`,
  bg600: `bg-${themeColor}-600`,
  bg700: `bg-${themeColor}-700`,
  bg100: `bg-${themeColor}-100`,
  text600: `text-${themeColor}-600`,
});

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
    <div className="flex flex-col h-screen bg-white relative">
      {showCompleteModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${themeColors.bg100}`}>
              <Award size={40} className={themeColors.text600} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Great Job, {child.name}!</h2>
            <p className="text-gray-500 mb-8">Lesson complete!</p>
            <div className="space-y-3">
              <button
                onClick={handleFinish}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition ${themeColors.bg600} text-white hover:${themeColors.bg700}`}
              >
                <CheckCircle size={24} /> Finish & Save
              </button>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                I'm still learning
              </button>
            </div>
          </div>
        </div>
      )}

      <header className={`${themeColors.bg600} text-white p-4 shadow-md flex items-center justify-between`}>
        <button onClick={handleExit} className="flex items-center space-x-2 hover:bg-white/20 p-2 rounded-lg transition">
          <ArrowLeft size={20} />
          <span>Exit Lesson</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold">{subject.name}</h1>
          <p className="text-sm opacity-90">{lesson.title}</p>
        </div>
        <div className="w-24 text-right flex items-center justify-end space-x-2">
          <span className="text-2xl">{child.avatar}</span>
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
