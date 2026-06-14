import type { Question, QuestionHistory } from '../types';

function calcWeight(q: Question, history: Record<string, QuestionHistory>): number {
  const h = history[q.id];
  if (!h || h.totalAttempts === 0) return 2.0;

  const errorRate = h.wrongCount / h.totalAttempts;
  const daysSinceLast = (Date.now() - h.lastSeenAt) / 86400000;

  let weight = 1.0 + errorRate * 3.0;
  weight += Math.min(daysSinceLast * 0.3, 2.0);
  if (h.lastResult === 'correct' && daysSinceLast < 1) weight *= 0.3;

  return weight;
}

function weightedSample<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function selectNext(
  pool: Question[],
  history: Record<string, QuestionHistory>,
  recentIds: string[]
): Question {
  if (pool.length === 0) throw new Error('Empty pool');

  // Count recent themes (last 10)
  const recentThemes = recentIds.slice(-10).map((id) => {
    const q = pool.find((q) => q.id === id);
    return q?.theme ?? '';
  });
  const themeCounts: Record<string, number> = {};
  for (const t of recentThemes) {
    themeCounts[t] = (themeCounts[t] ?? 0) + 1;
  }

  // Identify unseen questions
  const unseen = pool.filter((q) => !history[q.id] || history[q.id].totalAttempts === 0);

  let candidates = pool;

  // Guarantee at least 20% from unseen if available
  if (unseen.length > 0 && Math.random() < 0.2) {
    candidates = unseen;
  }

  const weights = candidates.map((q) => {
    let w = calcWeight(q, history);
    // Theme bias reduction
    if ((themeCounts[q.theme] ?? 0) >= 3) w *= 0.2;
    return Math.max(w, 0.01);
  });

  return weightedSample(candidates, weights);
}

export function filterPool(
  questions: Question[],
  filter: { chapter?: string; lesson?: number; theme?: string }
): Question[] {
  return questions.filter((q) => {
    if (filter.chapter && q.chapter !== filter.chapter) return false;
    if (filter.lesson !== undefined && q.lesson !== filter.lesson) return false;
    if (filter.theme && q.theme !== filter.theme) return false;
    return true;
  });
}
