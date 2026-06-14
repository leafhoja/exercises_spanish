import { useState } from 'react';
import type { Question } from '../types';
import { getAllHistory, getLast7Sessions, resetData } from '../lib/storage';

interface Props {
  questions: Question[];
  onHome: () => void;
}

export default function StatsScreen({ questions, onHome }: Props) {
  const history = getAllHistory();
  const sessions = getLast7Sessions();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

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

  // Group by chapter -> lesson numbers
  const byChapter: Record<string, number[]> = {};
  for (const q of questions) {
    if (!byChapter[q.chapter]) byChapter[q.chapter] = [];
    if (!byChapter[q.chapter].includes(q.lesson)) byChapter[q.chapter].push(q.lesson);
  }

  function getLessonStats(ch: string, lesson: number) {
    const qs = questions.filter((q) => q.chapter === ch && q.lesson === lesson);
    const total = qs.reduce((s, q) => s + (history[q.id]?.totalAttempts ?? 0), 0);
    const correct = qs.reduce((s, q) => {
      const h = history[q.id];
      return s + (h ? h.totalAttempts - h.wrongCount : 0);
    }, 0);
    return { total, rate: total > 0 ? Math.round((correct / total) * 100) : null };
  }

  function getLessonQuestions(ch: string, lesson: number) {
    return questions
      .filter((q) => q.chapter === ch && q.lesson === lesson)
      .map((q) => ({ q, h: history[q.id] }))
      .sort((a, b) => {
        const rA = a.h && a.h.totalAttempts > 0 ? a.h.wrongCount / a.h.totalAttempts : -1;
        const rB = b.h && b.h.totalAttempts > 0 ? b.h.wrongCount / b.h.totalAttempts : -1;
        return rB - rA;
      });
  }

  const maxCount = Math.max(...sessions.map((s) => s.count), 1);

  function handleReset() {
    if (window.confirm('全ての学習記録を削除しますか？')) {
      resetData();
      window.location.reload();
    }
  }

  return (
    <div className="min-h-dvh flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <button
          onClick={onHome}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">統計</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-6 space-y-8">

          {/* Summary — editorial numbers, no card boxes */}
          <div className="flex gap-8">
            <div>
              <div className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{totalAttempts}</div>
              <div className="text-xs text-zinc-400 mt-1">累計回答</div>
            </div>
            <div>
              <div className={`text-4xl font-bold tabular-nums ${
                totalAttempts === 0
                  ? 'text-zinc-200 dark:text-zinc-700'
                  : overallRate >= 70
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : 'text-amber-600 dark:text-amber-500'
              }`}>
                {totalAttempts > 0 ? `${overallRate}%` : '—'}
              </div>
              <div className="text-xs text-zinc-400 mt-1">正答率</div>
            </div>
            <div>
              <div className="text-4xl font-bold tabular-nums text-zinc-700 dark:text-zinc-300">
                {attempted.length}
              </div>
              <div className="text-xs text-zinc-400 mt-1">/{questions.length}問</div>
            </div>
          </div>

          {/* Last 7 days bar chart */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">直近7日間</p>
            <div className="flex items-end gap-1.5" style={{ height: '64px' }}>
              {sessions.map((s) => (
                <div key={s.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse" style={{ height: '48px' }}>
                    <div
                      className="w-full bg-zinc-300 dark:bg-zinc-700 transition-all"
                      style={{
                        height: `${(s.count / maxCount) * 48}px`,
                        minHeight: s.count > 0 ? '2px' : '0',
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {new Date(s.date + 'T12:00:00').toLocaleDateString('ja-JP', { weekday: 'narrow' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chapter / lesson drill-down */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">章別・レッスン別</p>
            <div className="border-t border-zinc-100 dark:border-zinc-900">
              {Object.entries(byChapter).sort(([a], [b]) => a.localeCompare(b)).map(([ch, lessons]) => (
                <div key={ch}>
                  {/* Chapter label */}
                  <div className="py-1.5 border-b border-zinc-100 dark:border-zinc-900 -mx-5 px-5 bg-zinc-50 dark:bg-zinc-900">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{ch}</span>
                  </div>

                  {/* Lesson rows */}
                  {lessons.sort((a, b) => a - b).map((lesson) => {
                    const key = `${ch}-${lesson}`;
                    const isExpanded = expandedKey === key;
                    const { total, rate } = getLessonStats(ch, lesson);
                    const lessonQs = getLessonQuestions(ch, lesson);

                    return (
                      <div key={key}>
                        <button
                          onClick={() => setExpandedKey(isExpanded ? null : key)}
                          className="w-full flex items-center gap-3 py-3 border-b border-zinc-100 dark:border-zinc-900 text-left"
                        >
                          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 w-12 shrink-0">
                            L{lesson}
                          </div>
                          <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            {rate !== null && (
                              <div
                                className={`h-full rounded-full transition-all ${
                                  rate >= 70 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-500' : 'bg-rose-400'
                                }`}
                                style={{ width: `${rate}%` }}
                              />
                            )}
                          </div>
                          <div className="text-sm font-medium tabular-nums w-10 text-right text-zinc-700 dark:text-zinc-300">
                            {rate !== null ? `${rate}%` : total > 0 ? '—' : '未'}
                          </div>
                          <div className="text-xs text-zinc-300 dark:text-zinc-700 w-4 text-right shrink-0">
                            {isExpanded ? '▲' : '▼'}
                          </div>
                        </button>

                        {/* Per-question detail (expanded) */}
                        {isExpanded && (
                          <div className="border-b border-zinc-100 dark:border-zinc-900 -mx-5">
                            {lessonQs.map(({ q, h }) => {
                              const attempts = h?.totalAttempts ?? 0;
                              const errorRate =
                                h && attempts > 0
                                  ? Math.round((h.wrongCount / attempts) * 100)
                                  : null;
                              return (
                                <div
                                  key={q.id}
                                  className="flex items-start gap-3 px-5 py-2.5 border-b border-zinc-50 dark:border-zinc-900 last:border-b-0 bg-zinc-50 dark:bg-zinc-900"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-zinc-800 dark:text-zinc-200 leading-snug">
                                      {q.ja}
                                    </div>
                                    {q.theme && (
                                      <div className="text-xs text-zinc-400 mt-0.5">{q.theme}</div>
                                    )}
                                  </div>
                                  <div className="shrink-0 text-right min-w-[3rem]">
                                    {errorRate !== null ? (
                                      <>
                                        <div className={`text-sm font-bold tabular-nums ${
                                          errorRate === 0
                                            ? 'text-emerald-500'
                                            : errorRate <= 40
                                            ? 'text-amber-500'
                                            : 'text-rose-500'
                                        }`}>
                                          {errorRate === 0 ? '✓' : `×${errorRate}%`}
                                        </div>
                                        <div className="text-xs text-zinc-400 tabular-nums">{attempts}回</div>
                                      </>
                                    ) : (
                                      <div className="text-xs text-zinc-300 dark:text-zinc-700">未</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Worst 10 */}
          {worst10.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                苦手 TOP{worst10.length}
              </p>
              <div className="border-t border-zinc-100 dark:border-zinc-900">
                {worst10.map(({ q, rate, h }, i) => (
                  <div key={q.id} className="flex items-center gap-3 py-2.5 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="text-xs text-zinc-300 dark:text-zinc-700 w-4 shrink-0 tabular-nums">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-800 dark:text-zinc-200 truncate">{q.ja}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{q.chapter} L{q.lesson} · {q.theme}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold text-rose-500 tabular-nums">{Math.round(rate * 100)}%</div>
                      <div className="text-xs text-zinc-400 tabular-nums">{h.totalAttempts}回</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset */}
          <div className="pb-4">
            <button
              onClick={handleReset}
              className="text-xs text-zinc-300 dark:text-zinc-700 hover:text-rose-500 dark:hover:text-rose-500 transition-colors underline"
            >
              データをリセット
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
