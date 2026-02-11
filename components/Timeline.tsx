import React, { useState, useEffect, useMemo, memo } from 'react';
import { ScheduleBlock, ChildProfile } from '../types';
import { Pencil } from 'lucide-react';

interface Props {
  schedule: ScheduleBlock[];
  onBlockClick: (childId: string, subjectId: string, topicId: string, lessonId: string, blockIndex: number) => void;
  focusedChildId?: string;
  children?: ChildProfile[];
}

const formatTimeMemo = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getChildDisplayMemo = (childId: string, children: ChildProfile[]) => {
  const child = children.find(c => c.id === childId);
  return {
    name: child?.name || (childId === 'adrian' ? 'Adrian' : childId === 'sophia' ? 'Sophia' : 'Child'),
    avatar: child?.avatar || (childId === 'adrian' ? '🧑‍🚀' : childId === 'sophia' ? '👩‍🎨' : '👤'),
    color: child?.themeColor || (childId === 'adrian' ? 'indigo' : childId === 'sophia' ? 'rose' : 'blue')
  };
};

const BlockRow = memo(function BlockRow({ block, blockIndex, allChildren, onBlockClick, currentTime, focusedChildId }: {
  block: ScheduleBlock;
  blockIndex: number;
  allChildren: ChildProfile[];
  onBlockClick: Props['onBlockClick'];
  currentTime: Date;
  focusedChildId?: string;
}) {
  const isNow = currentTime >= block.startTime && currentTime < block.endTime;
  const isPast = currentTime >= block.endTime;
  const isBreak = block.type === 'break' || block.type === 'lunch';

  if (isBreak) {
    return (
      <div className={`grid ${focusedChildId ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_1fr]'}`}>
        <div className={`grid ${focusedChildId ? 'grid-cols-[80px_1fr]' : `grid-cols-[80px_${allChildren.map(() => '1fr').join(' ')}]`} w-full bg-amber-50/50`}>
          <div className="p-4 text-xs font-medium text-gray-500 border-r border-gray-200 flex flex-col justify-center items-center">
            <span>{formatTimeMemo(block.startTime)}</span>
            <span className="opacity-50">{formatTimeMemo(block.endTime)}</span>
          </div>
          <div className={`p-4 flex items-center justify-center text-amber-700 font-medium ${focusedChildId ? '' : `col-span-${allChildren.length}`}`}>
            <span className="mr-2 text-lg">{block.type === 'lunch' ? '🍽️' : '☕'}</span>
            {block.label || 'Break'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${focusedChildId ? 'grid-cols-[80px_1fr]' : `grid-cols-[80px_${allChildren.map(() => '1fr').join(' ')}]`} group transition-colors ${isNow ? 'bg-blue-50/30' : ''}`}>
      <div className={`p-4 text-xs font-medium border-r-2 border-gray-400 flex flex-col justify-center items-center ${isNow ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
        <span>{formatTimeMemo(block.startTime)}</span>
        <span className="opacity-50">{formatTimeMemo(block.endTime)}</span>
        {isNow && <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
      </div>

      {allChildren.map((child, idx) => {
        const display = getChildDisplayMemo(child.id, allChildren);
        const childData = block.children?.[child.id];
        const showBorder = idx < allChildren.length - 1;

        return (
          <div 
            key={child.id}
            className={`p-4 ${showBorder ? 'border-r border-gray-300' : ''} relative hover:bg-gray-50 transition cursor-pointer ${isPast ? 'opacity-50' : ''}`}
          >
            {childData ? (
              <>
                {isNow && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${display.color}-500`}></div>}
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-800 text-sm">{childData.subjectName}</span>
                  <div className="flex items-center gap-1">
                    {childData.hasDevice ? (
                      <span className={`text-xs bg-${display.color}-100 text-${display.color}-700 px-1.5 py-0.5 rounded`}>📱</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">📓</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBlockClick(child.id, childData.subjectId, childData.topicId, childData.lessonId, blockIndex);
                      }}
                      className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <Pencil size={12} className="text-gray-500" />
                    </button>
                  </div>
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
  );
});

export const Timeline: React.FC<Props> = memo(({ schedule, onBlockClick, focusedChildId, children = [] }) => {
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

  const gridCols = useMemo(() => {
    return focusedChildId 
      ? "grid-cols-[80px_1fr]" 
      : `grid-cols-[80px_${allChildren.map(() => '1fr').join(' ')}]`;
  }, [focusedChildId, allChildren]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className={`grid ${gridCols} bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600`}>
        <div className="p-4 border-r-2 border-gray-400 text-center">Time</div>
        {allChildren.map((child, idx) => {
          const display = getChildDisplayMemo(child.id, allChildren);
          return (
            <div key={child.id} className={`p-4 text-${display.color}-700 flex items-center justify-center gap-2 ${idx < allChildren.length - 1 ? 'border-r-2 border-gray-400' : ''}`}>
              <span>{display.avatar}</span> {child.name || child.id}
            </div>
          );
        })}
      </div>

      <div className="divide-y divide-gray-100">
        {schedule.map((block, blockIndex) => (
          <BlockRow
            key={block.id}
            block={block}
            blockIndex={blockIndex}
            allChildren={allChildren}
            onBlockClick={onBlockClick}
            currentTime={currentTime}
            focusedChildId={focusedChildId}
          />
        ))}
      </div>
    </div>
  );
});
