import { useState } from 'react';
import type { Question } from '../types';

interface Props {
  question: Question;
  sessionIndex: number;
  sessionTotal: number;
  onResult: (result: 'correct' | 'wrong' | 'skip') => void;
}

export default function QuizScreen({ question, sessionIndex, sessionTotal, onResult }: Props) {
  const [revealed, setReveal] = useState(false);
  const progress = sessionIndex / Math.max(sessionTotal, 1);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="h-0.5 bg-gray-100 dark:bg-gray-900 w-full">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between px-5 py-3 text-xs text-gray-400 dark:text-gray-600">
        <span className="tabular-nums font-medium">{sessionIndex} / {sessionTotal}</span>
        <span className="flex items-center gap-2">
          <span>{question.chapter} L{question.lesson}</span>
          {question.theme && (
            <span className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-medium">
              {question.theme}
            </span>
          )}
          {question.isPredicted && (
            <span className="bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-medium">
              予想
            </span>
          )}
        </span>
      </div>

      {/* Question — the hero */}
      <div className="flex-1 flex flex-col justify-center px-5 pb-4">
        <p className="text-3xl font-bold leading-snug text-gray-900 dark:text-gray-100 mb-8">
          {question.ja}
        </p>

        {/* Fill: Spanish sentence with blanks */}
        {question.type === 'fill' && question.spanish && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <p className="text-xs text-gray-400 mb-2 font-medium">空欄を埋めよ</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
              {question.spanish}
            </p>
          </div>
        )}

        {/* Compose hint */}
        {question.type === 'compose' && !revealed && (
          <p className="text-sm text-gray-400 dark:text-gray-600 mb-6">
            スペイン語に訳せ
          </p>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-8 space-y-3">
        {!revealed ? (
          <button
            onClick={() => setReveal(true)}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-base font-bold transition-colors"
          >
            答えを見る
          </button>
        ) : (
          <>
            {/* Answer block */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl mb-1">
              {question.type === 'fill' && question.blanks && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {question.blanks.map((b, i) => (
                    <span
                      key={i}
                      className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-lg font-bold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
              {question.type === 'fill' && question.fullText && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{question.fullText}</p>
              )}
              {question.type === 'compose' && question.answer && (
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {question.answer}
                </p>
              )}
            </div>

            {/* Verdict buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onResult('correct')}
                className="h-16 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white rounded-xl text-xl font-bold transition-colors"
              >
                ○ 正解
              </button>
              <button
                onClick={() => onResult('wrong')}
                className="h-16 bg-red-500 hover:bg-red-400 active:bg-red-600 text-white rounded-xl text-xl font-bold transition-colors"
              >
                × 不正解
              </button>
            </div>
          </>
        )}

        <div className="text-center">
          <button
            onClick={() => onResult('skip')}
            className="text-xs text-gray-300 dark:text-gray-700 hover:text-gray-500 dark:hover:text-gray-500 py-2 transition-colors"
          >
            スキップ
          </button>
        </div>
      </div>
    </div>
  );
}
