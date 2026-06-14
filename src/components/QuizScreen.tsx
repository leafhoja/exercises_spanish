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
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 w-full">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{sessionIndex}/{sessionTotal}</span>
        <span className="flex gap-2">
          <span>{question.chapter} L{question.lesson}</span>
          {question.theme && (
            <span className="text-blue-500 dark:text-blue-400">{question.theme}</span>
          )}
          {question.isPredicted && (
            <span className="text-amber-500">予想</span>
          )}
        </span>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Japanese prompt */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 mb-2">日本語</div>
          <p className="text-lg leading-relaxed">{question.ja}</p>
        </div>

        {/* Spanish prompt (fill type) */}
        {question.type === 'fill' && question.spanish && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-400 mb-2">スペイン語（空欄を埋めよ）</div>
            <p className="text-xl leading-relaxed font-medium text-slate-800 dark:text-slate-200 tracking-wide">
              {question.spanish}
            </p>
          </div>
        )}

        {question.type === 'compose' && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-dashed border-slate-300 dark:border-slate-600">
            <div className="text-xs text-slate-400 mb-2">スペイン語に訳せ</div>
            <p className="text-slate-400 dark:text-slate-500 italic text-sm">（解答を考えてから「答えを見る」）</p>
          </div>
        )}

        {!revealed ? (
          <button
            onClick={() => setReveal(true)}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl text-lg font-semibold transition-colors"
          >
            答えを見る
          </button>
        ) : (
          <>
            {/* Answer reveal */}
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-5 border border-amber-200 dark:border-amber-700">
              <div className="text-xs text-amber-600 dark:text-amber-400 mb-2">解答</div>
              {question.type === 'fill' && question.blanks && (
                <div className="flex flex-wrap gap-2">
                  {question.blanks.map((b, i) => (
                    <span
                      key={i}
                      className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-3 py-1 rounded-lg text-lg font-bold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
              {question.type === 'fill' && question.fullText && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{question.fullText}</p>
              )}
              {question.type === 'compose' && question.answer && (
                <p className="text-xl font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {question.answer}
                </p>
              )}
            </div>

            {/* Correct / Wrong buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onResult('correct')}
                className="h-16 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-2xl text-xl font-bold transition-colors"
              >
                ○ 正解
              </button>
              <button
                onClick={() => onResult('wrong')}
                className="h-16 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-2xl text-xl font-bold transition-colors"
              >
                × 不正解
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => onResult('skip')}
          className="text-sm text-slate-400 dark:text-slate-500 underline text-center py-2"
        >
          この問題をスキップ
        </button>
      </div>
    </div>
  );
}
