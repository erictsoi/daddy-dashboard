import React, { useState, useEffect, useRef } from 'react';
import { Lesson, ChildProfile, Subject } from '../types';
import { ArrowLeft, Clock, CheckCircle, Play, Pause, BookOpen, AlertCircle, X, Award } from 'lucide-react';

interface Props {
  child: ChildProfile;
  subject: Subject;
  lesson: Lesson;
  onBack: () => void;
  onComplete: (lessonId: string, timeSpentSeconds: number) => void;
}

// Helper to extract ID from various YouTube URL formats
const getYouTubeID = (url: string | undefined) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export const LessonPlayer: React.FC<Props> = ({ child, subject, lesson, onBack, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(lesson.durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const playerRef = useRef<any>(null);
  
  // Calculate time spent based on total duration minus time left
  const timeSpent = (lesson.durationMinutes * 60) - timeLeft;

  const videoId = getYouTubeID(lesson.videoUrl);

  // --- YouTube API Integration ---
  useEffect(() => {
    if (!videoId) return;

    // 1. Load the IFrame Player API code asynchronously.
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // 2. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'modestbranding': 1,
          'rel': 0
        },
        events: {
          'onStateChange': onPlayerStateChange
        }
      });
    };

    return () => {
       // Cleanup if necessary
    };
  }, [videoId]);

  // Sync Timer with Video State
  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsActive(true);
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      setIsActive(false);
    }
  };

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(seconds => seconds - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = ((lesson.durationMinutes * 60 - timeLeft) / (lesson.durationMinutes * 60)) * 100;

  const handleManualToggle = () => {
    if (playerRef.current && playerRef.current.getPlayerState) {
        if (isActive) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    } else {
        // Fallback if player isn't ready
        setIsActive(!isActive);
    }
  };

  const handleFinish = () => {
    onComplete(lesson.id, timeSpent);
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      
      {/* --- Completion Modal --- */}
      {showCompleteModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-[scale-in_0.2s_ease-out]">
                <div className={`w-20 h-20 bg-${child.themeColor}-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Award size={40} className={`text-${child.themeColor}-600`} />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Great Job, {child.name}!</h2>
                <p className="text-gray-500 mb-8">
                    You've spent <span className="font-bold text-gray-800">{Math.floor(timeSpent / 60)} minutes</span> on this lesson.
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={handleFinish}
                        className={`w-full py-4 bg-${child.themeColor}-600 text-white rounded-xl font-bold text-lg hover:bg-${child.themeColor}-700 hover:scale-[1.02] transition shadow-lg flex items-center justify-center gap-2`}
                    >
                        <CheckCircle size={24} /> Finish Lesson
                    </button>
                    <button 
                        onClick={() => setShowCompleteModal(false)}
                        className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                        Wait, I'm not done yet
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-${child.themeColor}-600 text-white p-4 shadow-md flex items-center justify-between`}>
        <button onClick={onBack} className="flex items-center space-x-2 hover:bg-white/20 p-2 rounded-lg transition">
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
        {/* Main Content (Video) */}
        <div className="flex-1 bg-gray-900 flex flex-col justify-center items-center relative p-8">
           <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-4 ring-gray-800 relative group">
             {/* The ID used by YouTube API */}
             <div id="yt-player" className="w-full h-full"></div>
             
             {!videoId && (
                 <div className="absolute inset-0 flex items-center justify-center text-white/50">
                     Video Unavailable
                 </div>
             )}
           </div>
           
           <div className="mt-6 text-white/50 text-sm flex items-center gap-2">
               <AlertCircle size={16} /> Timer starts automatically when video plays
           </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
          
          {/* Timer Section */}
          <div className="p-6 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <Clock size={16} /> Session Timer
              </span>
              <span className={`font-mono text-2xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-800'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <div className="h-2 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
               <div className={`h-full bg-${child.themeColor}-500 transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
            </div>

            <button 
              onClick={handleManualToggle}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isActive 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : `bg-${child.themeColor}-600 text-white hover:bg-${child.themeColor}-700 shadow-lg`
              }`}
            >
              {isActive ? <><Pause size={20} /> Pause Video</> : <><Play size={20} /> Start Video</>}
            </button>
          </div>

          {/* Outcomes */}
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={18} className={`text-${child.themeColor}-600`} />
              Learning Outcomes
            </h3>
            <ul className="space-y-3">
              {lesson.outcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className={`mt-1 min-w-[6px] h-[6px] rounded-full bg-${child.themeColor}-400`} />
                  <span className="text-gray-600 text-sm leading-relaxed">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Complete Button */}
          <div className="p-6 bg-white border-t border-gray-200">
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
          </div>
        </div>
      </div>
    </div>
  );
};