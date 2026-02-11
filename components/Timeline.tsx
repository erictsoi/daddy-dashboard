import React, { useState, useEffect } from 'react';
import { ScheduleBlock, ChildProfile } from '../types';

interface Props {
  schedule: ScheduleBlock[];
  onBlockClick: (childId: string, subjectId: string, topicId: string, lessonId: string) => void;
  focusedChildId?: string;
  children?: ChildProfile[];
}

export const Timeline: React.FC<Props> = ({ schedule, onBlockClick, focusedChildId, children = [] }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const allChildren = focusedChildId 
    ? children.filter(c => c.id === focusedChildId)
    : children;

  const gridCols = focusedChildId 
    ? "grid-cols-[80px_1fr]" 
    : `grid-cols-[80px_${allChildren.map(() => '1fr').join('_')}]`.replace(/_/g, ' ');

  const getChildDisplay = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return {
      name: child?.name || (childId === 'adrian' ? 'Adrian' : childId === 'sophia' ? 'Sophia' : 'Child'),
      avatar: child?.avatar || (childId === 'adrian' ? '🧑‍🚀' : childId === 'sophia' ? '👩‍🎨' : '👤'),
      color: child?.themeColor || (childId === 'adrian' ? 'indigo' : childId === 'sophia' ? 'rose' : 'blue')
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className={`grid ${gridCols} bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600`}>
        <div className="p-4 border-r border-gray-200 text-center">Time</div>
        {allChildren.map(child => {
          const display = getChildDisplay(child.id);
          return (
            <div key={child.id} className={`p-4 text-${display.color}-700 flex items-center justify-center gap-2`}>
              <span>{display.avatar}</span> {display.name}
            </div>
          );
        })}
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
                <div className={`grid ${focusedChildId ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_1fr]'}`}>
                  <div className={`grid ${gridCols} w-full bg-amber-50/50`}>
                    <div className="p-4 text-xs font-medium text-gray-500 border-r border-gray-200 flex flex-col justify-center items-center">
                      <span>{formatTime(block.startTime)}</span>
                      <span className="opacity-50">{formatTime(block.endTime)}</span>
                    </div>
                    <div className={`p-4 flex items-center justify-center text-amber-700 font-medium ${focusedChildId ? '' : `col-span-${allChildren.length}`}`}>
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

                  {/* Child Cells */}
                  {allChildren.map((child, idx) => {
                    const display = getChildDisplay(child.id);
                    const childData = block.children?.[child.id];
                    const showBorder = idx < allChildren.length - 1;

                    return (
                      <div 
                        key={child.id}
                        onClick={() => childData && onBlockClick(child.id, childData.subjectId, childData.topicId, childData.lessonId)}
                        className={`p-4 ${showBorder ? 'border-r border-gray-200' : ''} relative hover:bg-gray-50 transition cursor-pointer ${isPast ? 'opacity-50' : ''}`}
                      >
                        {childData ? (
                          <>
                            {isNow && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${display.color}-500`}></div>}
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-gray-800 text-sm">{childData.subjectName}</span>
                              {childData.hasDevice ? (
                                <span className={`text-xs bg-${display.color}-100 text-${display.color}-700 px-1.5 py-0.5 rounded`}>📱</span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">📓</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 line-clamp-2">{childData.lessonTitle}</div>
                          </>
                        ) : (
                          <span className="text-gray-300 text-xs italic">Free</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
