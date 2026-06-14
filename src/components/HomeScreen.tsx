import { useState } from 'react';
import type { Question, QuizFilter } from '../types';
import { getTodayStats, getAllHistory } from '../lib/storage';

interface Props {
  questions: Question[];
  onStart: (filter: QuizFilter) => void;
  onStats: () => void;
}

const CHAPTER_LESSONS: Record<string, number[]> = {
  '1列': [2, 3, 4, 5, 6, 7],
  '2列': [1, 2, 3, 4, 5, 6],
};

export default function HomeScreen({ questions, onStart, onStats }: Props) {
  const [mode, setMode] = useState<'adaptive' | 'chapter' | 'theme'>('adaptive');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  const today = getTodayStats();
  const history = getAllHistory();

  const themes = [...new Set(questions.map((q) => q.theme))].filter(Boolean);

  const worst3 = questions
    .map((q) => ({ q, h: history[q.id] }))
    .filter(({ h }) => h && h.totalAttempts >= 2)
    .map(({ q, h }) => ({ q, rate: h!.wrongCount / h!.totalAttempts }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  function handleStart() {
    const filter: QuizFilter = { mode };
    if (mode === 'chapter') {
      if (!selectedChapter) return;
      filter.chapter = selectedChapter;
      if (selectedLesson !== null) filter.lesson = selectedLesson;
    } else if (mode === 'theme') {
      if (!selectedTheme) return;
      filter.theme = selectedTheme;
    }
    onStart(filter);
  }

  const canStart =
    mode === 'adaptive' ||
    (mode === 'chapter' && selectedChapter !== '') ||
    (mode === 'theme' && selectedTheme !== '');

  const correctRate =
    today.count > 0 ? Math.round((today.correct / today.count) * 100) : null;

  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-8 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            スペイン語
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">全{questions.length}問</p>
        </div>
        <button
          onClick={onStats}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
        >
          統計
        </button>
      </div>

      {/* Today's stats */}
      <div className="mx-5 mb-6 flex gap-3">
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {today.count}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">今日の問題</div>
        </div>
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3">
          <div className={`text-2xl font-bold tabular-nums ${
            correctRate === null
              ? 'text-gray-300 dark:text-gray-700'
              : correctRate >= 70
              ? 'text-emerald-600 dark:text-emerald-500'
              : 'text-amber-600 dark:text-amber-500'
          }`}>
            {correctRate !== null ? `${correctRate}%` : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">正答率</div>
        </div>
        {worst3.length > 0 && (
          <div className="flex-[2] bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3">
            <div className="text-xs text-gray-400 mb-1.5">苦手</div>
            <div className="space-y-0.5">
              {worst3.slice(0, 2).map(({ q, rate }) => (
                <div key={q.id} className="flex items-center gap-2">
                  <span className="text-red-500 text-xs font-semibold tabular-nums w-7 shrink-0">
                    {Math.round(rate * 100)}%
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{q.ja}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mode tabs */}
      <div className="mx-5 mb-5">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
          {(['adaptive', 'chapter', 'theme'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === m
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {m === 'adaptive' ? 'おまかせ' : m === 'chapter' ? '章別' : 'テーマ'}
            </button>
          ))}
        </div>
      </div>

      {/* Chapter selector */}
      {mode === 'chapter' && (
        <div className="mx-5 mb-5 space-y-4">
          {Object.entries(CHAPTER_LESSONS).map(([ch]) => (
            <div key={ch}>
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                {ch}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedChapter(ch); setSelectedLesson(null); }}
                  className={`h-9 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    selectedChapter === ch && selectedLesson === null
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  全て
                </button>
                {questions
                  .filter((q) => q.chapter === ch)
                  .map((q) => q.lesson)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .sort((a, b) => a - b)
                  .map((lesson) => (
                    <button
                      key={`${ch}-${lesson}`}
                      onClick={() => {
                        setSelectedChapter(ch);
                        setSelectedLesson(
                          selectedChapter === ch && selectedLesson === lesson ? null : lesson
                        );
                      }}
                      className={`h-9 px-3 rounded-lg text-sm font-semibold transition-colors ${
                        selectedChapter === ch && selectedLesson === lesson
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      L{lesson}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Theme selector */}
      {mode === 'theme' && (
        <div className="mx-5 mb-5">
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTheme(t)}
                className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  selectedTheme === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start button */}
      <div className="mt-auto mx-5 pb-8">
        <button
          disabled={!canStart}
          onClick={handleStart}
          className={`w-full h-14 rounded-xl text-base font-bold transition-all ${
            canStart
              ? 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-300 dark:text-gray-700'
          }`}
        >
          スタート
        </button>
      </div>
    </div>
  );
}
