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

  // Themes from available questions
  const themes = [...new Set(questions.map((q) => q.theme))].filter(Boolean);

  // Worst 3 by error rate
  const worst3 = questions
    .map((q) => ({ q, h: history[q.id] }))
    .filter(({ h }) => h && h.totalAttempts >= 2)
    .map(({ q, h }) => ({ q, rate: h!.wrongCount / h!.totalAttempts }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  // Available lessons for selected chapter
  const availableLessons = selectedChapter
    ? questions
        .filter((q) => q.chapter === selectedChapter)
        .map((q) => q.lesson)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a - b)
    : [];

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

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto flex flex-col gap-4">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">🇪🇸 スペイン語クイズ</h1>
      </div>

      {/* Today stats */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">今日の記録</span>
          <button
            onClick={onStats}
            className="text-sm text-blue-600 dark:text-blue-400 underline"
          >
            統計を見る
          </button>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{today.count}</div>
            <div className="text-xs text-slate-500">問</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {today.count > 0 ? Math.round((today.correct / today.count) * 100) : '-'}
            </div>
            <div className="text-xs text-slate-500">正答率%</div>
          </div>
        </div>
        {worst3.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="text-xs text-slate-500 mb-1">苦手トップ3</div>
            {worst3.map(({ q, rate }) => (
              <div key={q.id} className="text-xs flex justify-between py-0.5">
                <span className="text-slate-700 dark:text-slate-300 truncate flex-1 pr-2">
                  {q.ja.slice(0, 24)}{q.ja.length > 24 ? '…' : ''}
                </span>
                <span className="text-red-500 shrink-0">{Math.round(rate * 100)}%誤</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mode selection */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">モード</div>
        <div className="grid grid-cols-3 gap-2">
          {(['adaptive', 'chapter', 'theme'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {m === 'adaptive' ? 'おまかせ' : m === 'chapter' ? '章を選ぶ' : 'テーマ'}
            </button>
          ))}
        </div>

        {/* Chapter selector */}
        {mode === 'chapter' && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-slate-500 mb-2">章を選択</div>
            {Object.entries(CHAPTER_LESSONS).map(([ch]) => (
              <div key={ch}>
                <div className="text-xs text-slate-400 mb-1">{ch}</div>
                <div className="flex flex-wrap gap-2">
                  {availableLessons.length > 0 || selectedChapter !== ch
                    ? questions
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
                            className={`min-w-[48px] h-12 rounded-xl text-sm font-medium transition-colors ${
                              selectedChapter === ch && selectedLesson === lesson
                                ? 'bg-blue-600 text-white'
                                : selectedChapter === ch && selectedLesson === null
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {selectedChapter === ch && selectedLesson === null && (
                              <span className="text-xs">全</span>
                            )}
                            L{lesson}
                          </button>
                        ))
                    : null}
                </div>
              </div>
            ))}
            {/* Select all for a chapter */}
            <div className="flex gap-2 mt-2">
              {Object.keys(CHAPTER_LESSONS).map((ch) => (
                <button
                  key={`all-${ch}`}
                  onClick={() => { setSelectedChapter(ch); setSelectedLesson(null); }}
                  className={`flex-1 h-10 rounded-xl text-xs font-medium transition-colors ${
                    selectedChapter === ch && selectedLesson === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {ch}全て
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Theme selector */}
        {mode === 'theme' && (
          <div className="mt-4">
            <div className="text-sm text-slate-500 mb-2">テーマを選択</div>
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTheme(t)}
                  className={`px-3 h-10 rounded-xl text-sm transition-colors ${
                    selectedTheme === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Start button */}
      <button
        disabled={!canStart}
        onClick={handleStart}
        className={`w-full h-16 rounded-2xl text-xl font-bold transition-colors ${
          canStart
            ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
        }`}
      >
        スタート
      </button>

      <div className="text-center text-xs text-slate-400 pb-4">
        全{questions.length}問
      </div>
    </div>
  );
}
