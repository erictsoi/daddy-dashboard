import React, { useState, useEffect, useRef } from 'react';
import { Lesson, ChildProfile, Subject } from '../types';
import { ArrowLeft, Clock, CheckCircle, Play, Pause, BookOpen, AlertCircle, Award, Timer } from 'lucide-react';
import { usePersistentTimer, formatTime, formatTimeReadable } from '../src/lib/useTimer';

interface Props {
  child: ChildProfile;
  subject: Subject;
  lesson: Lesson;
  onBack: () => void;
  onComplete: (lessonId: string, timeSpentSeconds: number) => void;
}

const getYouTubeID = (url: string | undefined): string => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

const tc = (color: string, suffix: string = '') => `bg-${color}${suffix ? '-' + suffix : ''}`;
const tcText = (color: string, suffix: string = '') => `text-${color}${suffix ? '-' + suffix : ''}`;

export const LessonPlayer: React.FC<Props> = ({ child, subject, lesson, onBack, onComplete }) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [key, setKey] = useState(0);
  const videoId = getYouTubeID(lesson.videoUrl);
  
  const { isRunning, elapsed, start, stop, reset } = usePersistentTimer({
    subjectId: subject.id,
    onTick: () => {},
    onSave: () => {},
    autoSaveInterval: 30,
  });

  // Start timer when entering lesson
  useEffect(() => {
    start();
    setKey(k => k + 1);
    return () => stop();
  }, [subject.id]);

  const themeBg = tc(child.themeColor);
  const themeBg600 = tc(child.themeColor, '600');
  const themeBg700 = tc(child.themeColor, '700');
  const themeBg500 = tc(child.themeColor, '500');
  const themeBg100 = tc(child.themeColor, '100');
  const themeText600 = tcText(child.themeColor, '600');

  const handleFinish = () => {
    stop();
    onComplete(lesson.id, elapsed);
  };

  const handleExit = () => {
    stop();
    onBack();
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      {showCompleteModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
                <div className={'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ' + themeBg100}>
                    <Award size={40} className={themeText600} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Great Job, {child.name}!</h2>
                <p className="text-gray-500 mb-8">
                    You have spent <span className="font-bold text-gray-800">{formatTimeReadable(elapsed)}</span> on this subject.
                </p>
                <div className="space-y-3">
                    <button onClick={handleFinish} className={'w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition ' + themeBg600 + ' text-white hover:' + themeBg700}>
                        <CheckCircle size={24} /> Finish & Save
                    </button>
                    <button onClick={() => setShowCompleteModal(false)} className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">
                        I'm still learning
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className={themeBg600 + ' text-white p-4 shadow-md flex items-center justify-between'}>
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
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-gray-900 flex flex-col justify-center items-center relative p-8">
           <div key={key} className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-4 ring-gray-800 relative">
              {videoId ? (
                <iframe
                  className="w-full h-full"
                  src={'https://www.youtube.com/embed/' + videoId + '?autoplay=1&playsinline=1'}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                    Video Unavailable
                </div>
              )}
           </div>
           <div className="mt-6 text-white/50 text-sm flex items-center gap-2">
               <Timer size={16} /> Time is being tracked for this subject
           </div>
        </div>

        <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
           <div className="p-6 bg-white border-b border-gray-200">
             <div className="flex items-center justify-between mb-2">
               <span className="text-gray-500 font-medium flex items-center gap-2">
                 <Timer size={16} /> Time on Subject
               </span>
               <span className={'font-mono text-2xl font-bold ' + (isRunning ? 'text-green-600' : 'text-gray-800')}>
                 {formatTime(elapsed)} {isRunning && '⚡'}
               </span>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
               <Clock size={14} />
               <span>This session: {formatTime(elapsed)}</span>
             </div>
             <button 
               onClick={isRunning ? stop : start}
               className={'w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ' + 
                 (isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : themeBg600 + ' text-white hover:' + themeBg700 + ' shadow-lg')}
             >
               {isRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Resume</>}
             </button>
           </div>

           <div className="p-6 flex-1 overflow-y-auto">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
               <BookOpen size={18} className={themeText600} />
               Learning Outcomes
             </h3>
             <ul className="space-y-3">
               {lesson.outcomes.map((outcome, idx) => (
                 <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                   <div className={'mt-1 min-w-[6px] h-[6px] rounded-full ' + themeText600.replace('text-', 'bg-')} />
                   <span className="text-gray-600 text-sm leading-relaxed">{outcome}</span>
                 </li>
               ))}
             </ul>
           </div>

           <div className="p-6 bg-white border-t border-gray-200">
             {lesson.completed ? (
                <div className="w-full py-4 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2">
                  <CheckCircle size={24} /> Lesson Completed!
                </div>
             ) : (
               <button onClick={() => setShowCompleteModal(true)} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                 <CheckCircle size={20} /> Mark Complete
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
