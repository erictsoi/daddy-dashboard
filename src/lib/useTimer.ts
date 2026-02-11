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
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const savedTimeRef = useRef<number>(0);
  const lastSavedRef = useRef<number>(0);
  const subjectIdRef = useRef(subjectId);

  useEffect(() => {
    subjectIdRef.current = subjectId;
  }, [subjectId]);

  useEffect(() => {
    const storageKey = `timer_${subjectIdRef.current}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = parseInt(saved, 10);
      savedTimeRef.current = parsed;
      setElapsed(parsed);
    }
  }, []);

  const saveTime = useCallback((seconds: number) => {
    const storageKey = `timer_${subjectIdRef.current}`;
    localStorage.setItem(storageKey, seconds.toString());
    onSave?.(seconds);
  }, [onSave]);

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const now = Date.now();
      const sessionElapsed = Math.floor((now - startTimeRef.current) / 1000);
      const total = savedTimeRef.current + sessionElapsed;
      
      setElapsed(total);
      onTick?.(total);
      
      if (total - lastSavedRef.current >= autoSaveInterval) {
        saveTime(total);
        lastSavedRef.current = total;
      }
    };

    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, autoSaveInterval, onTick, saveTime]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const now = Date.now();
    const sessionElapsed = Math.floor((now - startTimeRef.current) / 1000);
    const total = savedTimeRef.current + sessionElapsed;
    
    saveTime(total);
    setElapsed(total);
    savedTimeRef.current = total;
  }, [saveTime]);

  const reset = useCallback(() => {
    stop();
    savedTimeRef.current = 0;
    setElapsed(0);
    localStorage.removeItem(`timer_${subjectIdRef.current}`);
  }, [stop]);

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
