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

  const worst10 = questions
    .map((q) => ({ q, h: history[q.id] }))
    .filter(({ h }) => h && h.totalAttempts >= 2)
    .map(({ q, h }) => ({ q, rate: h!.wrongCount / h!.totalAttempts, h: h! }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10);

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
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-5 py-6 gap-7">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onHome}
          className="text-sm font-medium text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">統計</h2>
      </div>

      {/* Summary numbers */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-4">
          <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {totalAttempts}
          </div>
          <div className="text-xs text-gray-400 mt-1">累計回答</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-4">
          <div className={`text-2xl font-bold tabular-nums ${
            overallRate >= 70
              ? 'text-emerald-600 dark:text-emerald-500'
              : 'text-amber-600 dark:text-amber-500'
          }`}>
            {totalAttempts > 0 ? `${overallRate}%` : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">正答率</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-4">
          <div className="text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
            {attempted.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">/ {questions.length}問</div>
        </div>
      </div>

      {/* Last 7 days bar chart */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">
          直近7日間
        </p>
        <div className="flex items-end gap-2 h-20">
          {sessions.map((s) => (
            <div key={s.date} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex flex-col-reverse" style={{ height: '64px' }}>
                <div
                  className="w-full bg-indigo-400 dark:bg-indigo-600 rounded-sm transition-all"
                  style={{
                    height: `${(s.count / maxCount) * 64}px`,
                    minHeight: s.count > 0 ? '3px' : '0',
                  }}
                />
              </div>
              <div className="text-[10px] text-gray-400">
                {new Date(s.date + 'T12:00:00').toLocaleDateString('ja-JP', { weekday: 'narrow' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worst 10 */}
      {worst10.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">
            苦手問題 TOP{worst10.length}
          </p>
          <div className="divide-y divide-gray-100 dark:divide-gray-900">
            {worst10.map(({ q, rate, h }, i) => (
              <div key={q.id} className="flex items-center gap-3 py-2.5">
                <div className="text-xs text-gray-300 dark:text-gray-700 w-4 shrink-0 tabular-nums">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{q.ja}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{q.chapter} L{q.lesson} · {q.theme}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-red-500 tabular-nums">{Math.round(rate * 100)}%</div>
                  <div className="text-xs text-gray-400 tabular-nums">{h.totalAttempts}回</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter accuracy */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">
          章別正答率
        </p>
        <div className="space-y-3">
          {Object.entries(chapterStats)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, stats]) => {
              const rate =
                stats.attempts > 0
                  ? Math.round((stats.correct / stats.attempts) * 100)
                  : null;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 w-20 shrink-0 tabular-nums">
                    {key}
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 dark:bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${rate ?? 0}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-10 text-right tabular-nums">
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
          className="text-xs text-gray-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-500 transition-colors underline"
        >
          データをリセット
        </button>
      </div>
    </div>
  );
}
