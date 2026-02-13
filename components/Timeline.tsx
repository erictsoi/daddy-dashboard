import React, { useState, useEffect, useMemo } from 'react';
import { ScheduleBlock, ChildProfile } from '../types';
import { Pencil } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 p-8 text-center text-gray-500">
        Loading schedule...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="grid grid-cols-[60px_1fr_1fr] bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
        <div className="p-3 text-center">Time</div>
        {allChildren.map((child) => {
          const display = getChildDisplay(child.id, allChildren);
          return (
            <div key={child.id} className={`p-3 text-center relative`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${display.color}-500`}></div>
              <span className="text-2xl mr-2">{display.avatar}</span>
              <span className={`text-${display.color}-700`}>{display.name}</span>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-100">
        {schedule.map((block, blockIndex) => {
          const isNow = currentTime >= block.startTime && currentTime < block.endTime;
          const isPast = currentTime >= block.endTime;
          const isBreak = block.type === 'break' || block.type === 'lunch';
          const isLunch = block.type === 'lunch';
          const breakDuration = isBreak ? Math.round((block.endTime.getTime() - block.startTime.getTime()) / 60000) : 0;
          const isShortBreak = isBreak && !isLunch && breakDuration <= 10;

          return (
            <div key={block.id} className={`grid grid-cols-[60px_1fr_1fr] group transition-colors ${isNow ? 'bg-blue-50/50' : ''}`}>
              {/* Time column - hide for short breaks */}
              <div className={`flex flex-col justify-center items-center border-r border-gray-200 ${isShortBreak ? '' : 'py-1'} ${isNow ? 'bg-blue-100' : ''}`}>
                {isShortBreak ? (
                  isNow && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                ) : (
                  <>
                    <span className="text-[10px] font-medium text-gray-500">{formatTime(block.startTime)}</span>
                    <span className="text-[10px] text-gray-400">{formatTime(block.endTime)}</span>
                  </>
                )}
              </div>

              {isBreak ? (
                // Break row - spans both columns, hide for short breaks
                <div className={`col-span-2 ${isShortBreak ? 'h-[40px] py-1' : 'p-3'} bg-amber-50 flex items-center justify-center text-amber-700 font-medium text-sm`}>
                  {isShortBreak ? (
                    <span className="mr-2 text-base">☕</span>
                  ) : (
                    <span className="mr-2 text-base">🍽️</span>
                  )}
                  {block.label || `${breakDuration} min ${isLunch ? 'Lunch & Free Time' : 'Break'}`}
                </div>
              ) : (
                // Academic blocks - show each child
                allChildren.map((child) => {
                  const display = getChildDisplay(child.id, allChildren);
                  const childData = block.children?.[child.id];
                  const isChildNow = isNow && childData?.hasDevice;

                  return (
                    <div 
                      key={child.id}
                      className={`p-3 border-r border-gray-200 last:border-r-0 relative hover:bg-gray-50 transition cursor-pointer ${isPast ? 'opacity-50' : ''} ${isChildNow ? 'bg-blue-50' : ''}`}
                      onClick={() => childData && onBlockClick(child.id, childData.subjectId, childData.topicId, childData.lessonId, blockIndex)}
                    >
                      {childData && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${display.color}-500`}></div>}
                      {childData ? (
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-800 text-sm">{childData.subjectName}</span>
                            <span className={`text-xs ${childData.hasDevice ? 'bg-green-100 text-green-700 px-1.5 py-0.5 rounded' : 'bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded'}`}>
                              {childData.hasDevice ? '📱' : '📓'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">{childData.lessonTitle}</div>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">Free</span>
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
