import { createSignal } from 'solid-js';
import type { ScoreResult } from '../utils/scoring';

export interface SessionRecord extends ScoreResult {
  timestamp: number;
  intervalMs: number;
}

const STORAGE_KEY = 'readspeed_stats';

function loadStats(): SessionRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStats(stats: SessionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function createStats() {
  const [sessions, setSessions] = createSignal<SessionRecord[]>(loadStats());

  const addSession = (result: ScoreResult, intervalMs: number) => {
    const record: SessionRecord = {
      ...result,
      timestamp: Date.now(),
      intervalMs,
    };

    setSessions(prev => {
      const updated = [record, ...prev].slice(0, 50); // Keep last 50 sessions
      saveStats(updated);
      return updated;
    });
  };

  const clearStats = () => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getAverageAccuracy = () => {
    const s = sessions();
    if (s.length === 0) return 0;
    return s.reduce((sum, r) => sum + r.accuracy, 0) / s.length;
  };

  const getBestAccuracy = () => {
    const s = sessions();
    if (s.length === 0) return 0;
    return Math.max(...s.map(r => r.accuracy));
  };

  return {
    sessions,
    addSession,
    clearStats,
    getAverageAccuracy,
    getBestAccuracy,
  };
}
