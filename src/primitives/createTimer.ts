import { createSignal, onCleanup } from 'solid-js';

export interface TimerState {
  currentIndex: number;
  isRunning: boolean;
  isFinished: boolean;
}

export function createWordTimer(words: () => string[], intervalMs: () => number) {
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [isRunning, setIsRunning] = createSignal(false);
  const [isFinished, setIsFinished] = createSignal(false);
  const [startTime, setStartTime] = createSignal<number | null>(null);

  let timerId: number | null = null;

  const start = () => {
    if (isRunning() || isFinished()) return;

    setIsRunning(true);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setIsFinished(false);

    const tick = () => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= words().length) {
          stop();
          setIsFinished(true);
          return prev;
        }
        return next;
      });
    };

    timerId = window.setInterval(tick, intervalMs());
  };

  const stop = () => {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    setIsRunning(false);
  };

  const reset = () => {
    stop();
    setCurrentIndex(0);
    setIsFinished(false);
    setStartTime(null);
  };

  const getElapsedTime = () => {
    const start = startTime();
    if (!start) return 0;
    return Date.now() - start;
  };

  onCleanup(() => {
    if (timerId !== null) {
      clearInterval(timerId);
    }
  });

  return {
    currentIndex,
    isRunning,
    isFinished,
    start,
    stop,
    reset,
    getElapsedTime,
  };
}
