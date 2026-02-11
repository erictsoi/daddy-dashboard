import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  subjectId: string;
  onTick?: (seconds: number) => void;
  onSave?: (seconds: number) => void;
  autoSaveInterval?: number;
}

export const usePersistentTimer = ({
  subjectId,
  onTick,
  onSave,
  autoSaveInterval = 30,
}: UseTimerOptions) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const savedTimeRef = useRef<number>(0);
  const lastSavedRef = useRef<number>(0);

  useEffect(() => {
    const storageKey = `timer_${subjectId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = parseInt(saved, 10);
      savedTimeRef.current = parsed;
      setElapsed(parsed);
    }
  }, [subjectId]);

  const saveTime = useCallback((seconds: number) => {
    const storageKey = `timer_${subjectId}`;
    localStorage.setItem(storageKey, seconds.toString());
    onSave?.(seconds);
  }, [subjectId, onSave]);

  const tick = useCallback(() => {
    const now = Date.now();
    const sessionElapsed = Math.floor((now - startTimeRef.current) / 1000);
    const total = savedTimeRef.current + sessionElapsed;
    
    setElapsed(total);
    onTick?.(total);
    
    if (total - lastSavedRef.current >= autoSaveInterval) {
      saveTime(total);
      lastSavedRef.current = total;
    }
  }, [autoSaveInterval, onTick, saveTime]);

  const start = useCallback(() => {
    if (isRunning) return;
    
    startTimeRef.current = Date.now();
    setIsRunning(true);
    
    intervalRef.current = setInterval(tick, 1000);
  }, [isRunning, tick]);

  const stop = useCallback(() => {
    if (!isRunning) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const now = Date.now();
    const sessionElapsed = Math.floor((now - startTimeRef.current) / 1000);
    const total = savedTimeRef.current + sessionElapsed;
    
    saveTime(total);
    setIsRunning(false);
    setElapsed(total);
    savedTimeRef.current = total;
  }, [isRunning, saveTime]);

  const reset = useCallback(() => {
    stop();
    savedTimeRef.current = 0;
    setElapsed(0);
    localStorage.removeItem(`timer_${subjectId}`);
  }, [stop, subjectId]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { isRunning, elapsed, start, stop, reset };
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

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
