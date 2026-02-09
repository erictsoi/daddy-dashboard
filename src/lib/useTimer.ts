import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  subjectId: string;
  onTick?: (seconds: number) => void;
  onSave?: (seconds: number) => void;
  autoSaveInterval?: number; // Save every N seconds
}

export const usePersistentTimer = ({
  subjectId,
  onTick,
  onSave,
  autoSaveInterval = 30, // Save every 30 seconds by default
}: UseTimerOptions) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lastSaved, setLastSaved] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const savedTimeRef = useRef<number>(0);

  // Load saved time from localStorage on mount
  useEffect(() => {
    const storageKey = `timer_${subjectId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = parseInt(saved, 10);
      savedTimeRef.current = parsed;
      setElapsed(parsed);
    }
  }, [subjectId]);

  const start = useCallback(() => {
    if (isRunning) return;
    
    startTimeRef.current = Date.now();
    setIsRunning(true);
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const sessionElapsed = Math.floor((now - startTimeRef.current) / 1000);
      const total = savedTimeRef.current + sessionElapsed;
      
      setElapsed(total);
      onTick?.(total);
      
      // Auto-save check
      if (total - lastSaved >= autoSaveInterval) {
        const storageKey = `timer_${subjectId}`;
        localStorage.setItem(storageKey, total.toString());
        onSave?.(total);
        setLastSaved(total);
      }
    }, 1000);
  }, [isRunning, subjectId, onTick, onSave, autoSaveInterval, lastSaved]);

  const stop = useCallback(() => {
    if (!isRunning) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const now = Date.now();
    const sessionElapsed = Math.floor((now - startTimeRef.current) / 1000);
    const total = savedTimeRef.current + sessionElapsed;
    
    // Save final time
    const storageKey = `timer_${subjectId}`;
    localStorage.setItem(storageKey, total.toString());
    onSave?.(total);
    
    setIsRunning(false);
    setElapsed(total);
    savedTimeRef.current = total;
  }, [isRunning, subjectId, onSave]);

  const reset = useCallback(() => {
    stop();
    savedTimeRef.current = 0;
    setElapsed(0);
    localStorage.removeItem(`timer_${subjectId}`);
  }, [stop, subjectId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    elapsed,
    start,
    stop,
    reset,
  };
};

// Format seconds to HH:MM:SS
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Format seconds to human readable (e.g., "2h 30m")
export const formatTimeReadable = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return '<1m';
};
