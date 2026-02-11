import React, { memo, useMemo } from 'react';

interface Props {
  current: number;
  total: number;
  colorClass?: string;
  heightClass?: string;
}

export const ProgressBar: React.FC<Props> = memo(({ current, total, colorClass = "bg-green-500", heightClass = "h-2" }) => {
  const percentage = useMemo(() => {
    return total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  }, [current, total]);
  
  return (
    <div className={`w-full bg-gray-200 rounded-full ${heightClass} overflow-hidden`}>
      <div 
        className={`${heightClass} rounded-full transition-all duration-500 ease-out ${colorClass}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});