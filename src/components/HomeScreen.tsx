import { useState } from 'react';
import type { Question, QuizFilter } from '../types';
import { getTodayStats, getAllHistory } from '../lib/storage';

interface Props {
  questions: Question[];
  onStart: (filter: QuizFilter) => void;
  onStats: () => void;
  showHint: boolean;
  onToggleHint: () => void;
  verbHintAlwaysOpen: boolean;
  onToggleVerbHintAlwaysOpen: () => void;
}

const CHAPTER_LESSONS: Record<string, number[]> = {
  '1列': [2, 3, 4, 5, 6, 7],
  '2列': [1, 2, 3, 4, 5, 6],
};

export default function HomeScreen({ questions, onStart, onStats, showHint, onToggleHint, verbHintAlwaysOpen, onToggleVerbHintAlwaysOpen }: Props) {
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
    <div className="min-h-dvh max-w-lg mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">スペイン語</h1>
            <span className="text-base">🇪🇸</span>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">全{questions.length}問</p>
        </div>
        <button
          onClick={onStats}
          className="text-sm font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          統計
        </button>
      </div>

      {/* Today stats — editorial numbers, no card boxes */}
      <div className="flex items-center gap-5 px-5 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{today.count}</div>
          <div className="text-xs text-zinc-400 mt-0.5">今日</div>
        </div>
        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div>
          <div className={`text-3xl font-bold tabular-nums ${
            correctRate === null
              ? 'text-zinc-200 dark:text-zinc-700'
              : correctRate >= 70
              ? 'text-emerald-600 dark:text-emerald-500'
              : 'text-amber-600 dark:text-amber-500'
          }`}>
            {correctRate !== null ? `${correctRate}%` : '—'}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">正答率</div>
        </div>
        {worst3.length > 0 && (
          <>
            <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-zinc-400 mb-1">苦手</div>
              {worst3.slice(0, 2).map(({ q, rate }) => (
                <div key={q.id} className="flex items-center gap-1.5">
                  <span className="text-rose-500 text-xs font-semibold tabular-nums w-7 shrink-0">
                    {Math.round(rate * 100)}%
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{q.ja}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mode tabs — underline style */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-5 mt-1">
        {(['adaptive', 'chapter', 'theme'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`py-3 px-1 mr-6 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              mode === m
                ? 'border-red-500 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400'
            }`}
          >
            {m === 'adaptive' ? 'おまかせ' : m === 'chapter' ? '章別' : 'テーマ'}
          </button>
        ))}
      </div>

      {/* Chapter selector */}
      {mode === 'chapter' && (
        <div className="px-5 pt-4 pb-2 space-y-4">
          {Object.entries(CHAPTER_LESSONS).map(([ch]) => (
            <div key={ch}>
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{ch}</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => { setSelectedChapter(ch); setSelectedLesson(null); }}
                  className={`h-8 px-3 rounded text-xs font-semibold transition-colors ${
                    selectedChapter === ch && selectedLesson === null
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800'
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
                      className={`h-8 px-3 rounded text-sm font-semibold transition-colors ${
                        selectedChapter === ch && selectedLesson === lesson
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                          : 'border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800'
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
        <div className="px-5 pt-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTheme(t)}
                className={`h-8 px-3 rounded text-sm font-medium transition-colors ${
                  selectedTheme === t
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start button + hint toggles */}
      <div className="mt-auto px-5 pb-8 pt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">穴埋めヒント</span>
          <button
            onClick={onToggleHint}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              showHint
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                : 'bg-transparent text-zinc-400 dark:text-zinc-500 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400'
            }`}
          >
            {showHint ? 'あり' : 'なし'}
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">動詞ヒント（初期表示）</span>
          <button
            onClick={onToggleVerbHintAlwaysOpen}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              verbHintAlwaysOpen
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                : 'bg-transparent text-zinc-400 dark:text-zinc-500 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400'
            }`}
          >
            {verbHintAlwaysOpen ? '常に表示' : '折りたたむ'}
          </button>
        </div>
        <button
          disabled={!canStart}
          onClick={handleStart}
          className={`w-full h-13 rounded-xl text-base font-bold transition-all ${
            canStart
              ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'
          }`}
        >
          スタート
        </button>
      </div>
    </div>
  );
}
