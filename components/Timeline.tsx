import React, { useState, useEffect } from 'react';
import { ScheduleBlock } from '../types';

interface Props {
  schedule: ScheduleBlock[];
  onBlockClick: (childId: string, subjectId: string, lessonId: string) => void;
  focusedChildId?: string;
}

export const Timeline: React.FC<Props> = ({ schedule, onBlockClick, focusedChildId }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const showAdrian = !focusedChildId || focusedChildId === 'adrian';
  const showSophia = !focusedChildId || focusedChildId === 'sophia';

  const gridCols = focusedChildId 
    ? "grid-cols-[80px_1fr]" 
    : "grid-cols-[80px_1fr_1fr]";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className={`grid ${gridCols} bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600`}>
        <div className="p-4 border-r border-gray-200 text-center">Time</div>
        {showAdrian && (
            <div className={`p-4 ${showSophia ? 'border-r border-gray-200' : ''} text-indigo-700 flex items-center justify-center gap-2`}>
            <span>🧑‍🚀</span> Adrian
            </div>
        )}
        {showSophia && (
            <div className="p-4 text-rose-700 flex items-center justify-center gap-2">
            <span>👩‍🎨</span> Sophia
            </div>
        )}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {schedule.map((block) => {
          const isNow = currentTime >= block.startTime && currentTime < block.endTime;
          const isPast = currentTime >= block.endTime;
          const isBreak = block.type === 'break' || block.type === 'lunch';

          return (
            <React.Fragment key={block.id}>
              {isBreak ? (
                 <div className={`grid ${focusedChildId ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_1fr]' /* Break is always full width effectively, but we need matching col span or separate grid */}`}>
                    {/* For breaks, we usually span across. Let's just keep the grid structure consistent */}
                    <div className={`grid ${gridCols} w-full bg-amber-50/50`}>
                        <div className="p-4 text-xs font-medium text-gray-500 border-r border-gray-200 flex flex-col justify-center items-center">
                            <span>{formatTime(block.startTime)}</span>
                            <span className="opacity-50">{formatTime(block.endTime)}</span>
                        </div>
                        <div className={`p-4 flex items-center justify-center text-amber-700 font-medium ${focusedChildId ? '' : 'col-span-2'}`}>
                            <span className="mr-2 text-lg">{block.type === 'lunch' ? '🍽️' : '☕'}</span>
                            {block.label || 'Break'}
                        </div>
                    </div>
                 </div>
              ) : (
                <div className={`grid ${gridCols} group transition-colors ${isNow ? 'bg-blue-50/30' : ''}`}>
                    {/* Time Column */}
                    <div className={`p-4 text-xs font-medium border-r border-gray-200 flex flex-col justify-center items-center ${isNow ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                        <span>{formatTime(block.startTime)}</span>
                        <span className="opacity-50">{formatTime(block.endTime)}</span>
                        {isNow && <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                    </div>

                    {/* Adrian Cell */}
                    {showAdrian && (
                        <div 
                        onClick={() => block.adrian && onBlockClick('adrian', block.adrian.subjectId, block.adrian.lessonId)}
                        className={`p-4 ${showSophia ? 'border-r border-gray-200' : ''} relative hover:bg-gray-50 transition cursor-pointer ${isPast ? 'opacity-50' : ''}`}
                        >
                            {block.adrian ? (
                            <>
                                {isNow && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-gray-800 text-sm">{block.adrian.subjectName}</span>
                                    {block.adrian.hasDevice ? (
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">📱</span>
                                    ) : (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">📓</span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-600 line-clamp-2">{block.adrian.lessonTitle}</div>
                            </>
                            ) : (
                                <span className="text-gray-300 text-xs italic">Free</span>
                            )}
                        </div>
                    )}

                    {/* Sophia Cell */}
                    {showSophia && (
                        <div 
                        onClick={() => block.sophia && onBlockClick('sophia', block.sophia.subjectId, block.sophia.lessonId)}
                        className={`p-4 relative hover:bg-gray-50 transition cursor-pointer ${isPast ? 'opacity-50' : ''}`}
                        >
                            {block.sophia ? (
                            <>
                                {isNow && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>}
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-gray-800 text-sm">{block.sophia.subjectName}</span>
                                    {block.sophia.hasDevice ? (
                                        <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">📱</span>
                                    ) : (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">📓</span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-600 line-clamp-2">{block.sophia.lessonTitle}</div>
                            </>
                            ) : (
                                <span className="text-gray-300 text-xs italic">Free</span>
                            )}
                        </div>
                    )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};