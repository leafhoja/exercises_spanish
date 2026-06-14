import type { StorageData, QuestionHistory, DaySession } from '../types';

const KEY = 'spanish_quiz_history';
const VERSION = 1;

const defaultData = (): StorageData => ({
  version: VERSION,
  history: {},
  sessions: [],
});

export function loadData(): StorageData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData();
    const data = JSON.parse(raw) as StorageData;
    if (data.version !== VERSION) return defaultData();
    return data;
  } catch {
    return defaultData();
  }
}

function saveData(data: StorageData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getHistory(id: string): QuestionHistory | undefined {
  return loadData().history[id];
}

export function recordResult(id: string, result: 'correct' | 'wrong'): void {
  const data = loadData();
  const h = data.history[id] ?? {
    totalAttempts: 0,
    wrongCount: 0,
    lastSeenAt: 0,
    lastResult: 'correct' as const,
    recentResults: [],
  };

  h.totalAttempts += 1;
  if (result === 'wrong') h.wrongCount += 1;
  h.lastSeenAt = Date.now();
  h.lastResult = result;
  h.recentResults = [...h.recentResults.slice(-9), result];

  data.history[id] = h;

  // Update today's session
  const today = new Date().toISOString().slice(0, 10);
  const todayIdx = data.sessions.findIndex((s) => s.date === today);
  if (todayIdx >= 0) {
    data.sessions[todayIdx].count += 1;
    if (result === 'correct') data.sessions[todayIdx].correct += 1;
  } else {
    data.sessions.push({ date: today, count: 1, correct: result === 'correct' ? 1 : 0 });
  }

  saveData(data);
}

export function getTodayStats(): DaySession {
  const today = new Date().toISOString().slice(0, 10);
  const s = loadData().sessions.find((s) => s.date === today);
  return s ?? { date: today, count: 0, correct: 0 };
}

export function getLast7Sessions(): DaySession[] {
  const data = loadData();
  const days: DaySession[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const s = data.sessions.find((s) => s.date === date);
    days.push(s ?? { date, count: 0, correct: 0 });
  }
  return days;
}

export function getAllHistory(): StorageData['history'] {
  return loadData().history;
}

export function resetData(): void {
  localStorage.removeItem(KEY);
}
