import React, { useState, useEffect, useMemo } from 'react';
import { ScheduleBlock, ChildProfile } from '../types';
import { Pencil } from 'lucide-react';

interface Props {
  schedule: ScheduleBlock[];
  onBlockClick: (childId: string, subjectId: string, topicId: string, lessonId: string, blockIndex: number) => void;
  focusedChildId?: string;
  children?: ChildProfile[];
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

export const Timeline: React.FC<Props> = ({ schedule, onBlockClick, focusedChildId, children = [] }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const allChildren = useMemo(() => {
    return focusedChildId 
      ? children.filter(c => c.id === focusedChildId)
      : children;
  }, [focusedChildId, children]);

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
      <div className="grid grid-cols-[80px_1fr_1fr] bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
        <div className="p-4 border-r-2 border-gray-400 text-center">Time</div>
        {allChildren.map((child) => {
          const display = getChildDisplay(child.id, allChildren);
          return (
            <div key={child.id} className={`p-4 text-center border-r-2 border-gray-400 last:border-r-0`}>
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

          return (
            <div key={block.id} className={`grid grid-cols-[80px_1fr_1fr] group transition-colors ${isNow ? 'bg-blue-50/50' : ''}`}>
              {/* Time column */}
              <div className={`p-3 text-xs font-medium border-r border-gray-200 flex flex-col justify-center items-center ${isNow ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                <span>{formatTime(block.startTime)}</span>
                <span className="opacity-50 text-xs">{formatTime(block.endTime)}</span>
                {isNow && <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
              </div>

              {isBreak ? (
                // Break row - spans both columns
                <div className="col-span-2 p-3 bg-amber-50 flex items-center justify-center text-amber-700 font-medium">
                  <span className="mr-2 text-lg">{block.type === 'lunch' ? '🍽️' : '☕'}</span>
                  {block.label || 'Break'}
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
                      {childData ? (
                        <>
                          {isChildNow && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${display.color}-500`}></div>}
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-800 text-sm">{childData.subjectName}</span>
                            <span className={`text-xs ${childData.hasDevice ? 'bg-green-100 text-green-700 px-1.5 py-0.5 rounded' : 'bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded'}`}>
                              {childData.hasDevice ? '📱' : '📓'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">{childData.lessonTitle}</div>
                        </>
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
