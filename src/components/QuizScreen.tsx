import { useState } from 'react';
import type { Question } from '../types';
import { extractVerbHints } from '../lib/parseExp';

interface Props {
  question: Question;
  sessionIndex: number;
  sessionTotal: number;
  onResult: (result: 'correct' | 'wrong' | 'skip') => void;
  showHint: boolean;
  verbHintAlwaysOpen: boolean;
}

export default function QuizScreen({ question, sessionIndex, sessionTotal, onResult, showHint, verbHintAlwaysOpen }: Props) {
  const [revealed, setReveal] = useState(false);
  const verbHints = extractVerbHints(question.exp ?? '');
  const [verbHintOpen, setVerbHintOpen] = useState(verbHintAlwaysOpen && verbHints.length > 0);
  const progress = sessionIndex / Math.max(sessionTotal, 1);
  const jaLen = question.ja.length;
  const questionTextSize = jaLen < 18 ? 'text-3xl' : jaLen < 30 ? 'text-2xl' : 'text-xl';

  return (
    <div className="min-h-dvh flex flex-col max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="h-0.5 bg-zinc-100 dark:bg-zinc-900 w-full">
        <div
          className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between px-5 py-3 text-xs text-zinc-400 dark:text-zinc-600 border-b border-zinc-100 dark:border-zinc-900">
        <span className="tabular-nums font-medium">{sessionIndex} / {sessionTotal}</span>
        <span className="flex items-center gap-2">
          <span>{question.chapter} L{question.lesson}</span>
          {question.theme && (
            <span className="border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded text-[11px] font-medium">
              {question.theme}
            </span>
          )}
          {question.isPredicted && (
            <span className="border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-[11px] font-medium">
              予想
            </span>
          )}
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-5 pb-4">
        <p className={`${questionTextSize} font-bold leading-snug text-zinc-900 dark:text-zinc-100 mb-8`}>
          {question.ja}
        </p>

        {/* Verb hint (collapsible) */}
        {verbHints.length > 0 && !revealed && (
          <div className="mb-4">
            <button
              onClick={() => setVerbHintOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              <span>{verbHintOpen ? '▾' : '▸'}</span>
              <span>動詞ヒント</span>
            </button>
            {verbHintOpen && (
              <div className="mt-2 flex flex-wrap gap-2">
                {verbHints.map((v, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 font-mono"
                  >
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fill: Spanish sentence with blanks */}
        {question.type === 'fill' && question.spanish && showHint && !revealed && (
          <div className="mb-6 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <p className="text-xs text-zinc-400 mb-2 font-medium">空欄を埋めよ</p>
            <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
              {question.spanish}
            </p>
          </div>
        )}
        {question.type === 'fill' && question.spanish && !showHint && !revealed && (
          <p className="text-sm text-zinc-400 dark:text-zinc-600 mb-6">スペイン語文を構成せよ</p>
        )}

        {/* Compose hint */}
        {question.type === 'compose' && !revealed && (
          <p className="text-sm text-zinc-400 dark:text-zinc-600 mb-6">スペイン語に訳せ</p>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-8 space-y-3">
        {!revealed ? (
          <button
            onClick={() => setReveal(true)}
            className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-base font-bold transition-colors shadow-sm active:shadow-none active:translate-y-px"
          >
            答えを見る
          </button>
        ) : (
          <>
            {/* Answer block */}
            <div className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              {question.type === 'fill' && question.blanks && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {question.blanks.map((b, i) => (
                    <span
                      key={i}
                      className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1 rounded text-lg font-bold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
              {question.type === 'fill' && question.fullText && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">{question.fullText}</p>
              )}
              {question.type === 'compose' && question.answer && (
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{question.answer}</p>
              )}
            </div>

            {/* Explanation */}
            {question.exp && (
              <div className="px-4 py-3 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">解説</p>
                <div className="exp-content text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.exp }} />
              </div>
            )}

            {/* Verdict buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onResult('correct')}
                className="h-16 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white rounded-lg text-xl font-bold transition-colors"
              >
                ○ 正解
              </button>
              <button
                onClick={() => onResult('wrong')}
                className="h-16 bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-white rounded-lg text-xl font-bold transition-colors"
              >
                × 不正解
              </button>
            </div>
          </>
        )}

        <div className="text-center">
          <button
            onClick={() => onResult('skip')}
            className="text-xs text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-500 py-2 transition-colors"
          >
            スキップ
          </button>
        </div>
      </div>
    </div>
  );
}
