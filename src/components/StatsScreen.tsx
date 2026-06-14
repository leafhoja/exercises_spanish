import type { Question } from '../types';
import { getAllHistory, getLast7Sessions, resetData } from '../lib/storage';

interface Props {
  questions: Question[];
  onHome: () => void;
}

export default function StatsScreen({ questions, onHome }: Props) {
  const history = getAllHistory();
  const sessions = getLast7Sessions();

  const attempted = questions.filter((q) => history[q.id]?.totalAttempts > 0);
  const totalAttempts = Object.values(history).reduce((s, h) => s + h.totalAttempts, 0);
  const totalCorrect = Object.values(history).reduce(
    (s, h) => s + (h.totalAttempts - h.wrongCount),
    0
  );
  const overallRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Worst 10
  const worst10 = questions
    .map((q) => ({ q, h: history[q.id] }))
    .filter(({ h }) => h && h.totalAttempts >= 2)
    .map(({ q, h }) => ({ q, rate: h!.wrongCount / h!.totalAttempts, h: h! }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10);

  // Chapter/theme stats
  const chapterStats: Record<string, { attempts: number; correct: number }> = {};
  for (const q of questions) {
    const key = `${q.chapter} L${q.lesson}`;
    const h = history[q.id];
    if (!chapterStats[key]) chapterStats[key] = { attempts: 0, correct: 0 };
    if (h) {
      chapterStats[key].attempts += h.totalAttempts;
      chapterStats[key].correct += h.totalAttempts - h.wrongCount;
    }
  }

  const maxCount = Math.max(...sessions.map((s) => s.count), 1);

  function handleReset() {
    if (window.confirm('全ての学習記録を削除しますか？')) {
      resetData();
      window.location.reload();
    }
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto p-4 gap-4">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onHome}
          className="h-10 px-4 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-medium"
        >
          ← 戻る
        </button>
        <h2 className="text-xl font-bold">統計</h2>
      </div>

      {/* Overall */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-400 mb-3">全体</div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalAttempts}</div>
            <div className="text-xs text-slate-400">累計回答</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{overallRate}%</div>
            <div className="text-xs text-slate-400">正答率</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{attempted.length}</div>
            <div className="text-xs text-slate-400">/ {questions.length}問</div>
          </div>
        </div>
      </div>

      {/* Last 7 days graph */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-400 mb-3">直近7日間</div>
        <div className="flex items-end gap-1 h-20">
          {sessions.map((s) => (
            <div key={s.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col-reverse" style={{ height: '64px' }}>
                <div
                  className="w-full bg-blue-400 dark:bg-blue-600 rounded-t transition-all"
                  style={{ height: `${(s.count / maxCount) * 64}px` }}
                />
              </div>
              <div className="text-xs text-slate-400">
                {new Date(s.date + 'T12:00:00').toLocaleDateString('ja-JP', { weekday: 'narrow' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worst 10 */}
      {worst10.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 mb-3">苦手問題トップ{worst10.length}</div>
          <div className="space-y-2">
            {worst10.map(({ q, rate, h }) => (
              <div key={q.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-600 dark:text-slate-300 truncate">{q.ja}</div>
                  <div className="text-xs text-slate-400">{q.chapter} L{q.lesson} · {q.theme}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-red-500">{Math.round(rate * 100)}%誤</div>
                  <div className="text-xs text-slate-400">{h.totalAttempts}回</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-400 mb-3">章別正答率</div>
        <div className="space-y-2">
          {Object.entries(chapterStats)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, stats]) => {
              const rate = stats.attempts > 0
                ? Math.round((stats.correct / stats.attempts) * 100)
                : null;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="text-sm text-slate-700 dark:text-slate-300 w-20 shrink-0">{key}</div>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 dark:bg-blue-600 rounded-full"
                      style={{ width: `${rate ?? 0}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 w-10 text-right">
                    {rate !== null ? `${rate}%` : '—'}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Reset */}
      <div className="pb-4">
        <button
          onClick={handleReset}
          className="w-full h-12 border-2 border-red-300 dark:border-red-700 text-red-500 dark:text-red-400 rounded-2xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          データをリセット
        </button>
      </div>
    </div>
  );
}
