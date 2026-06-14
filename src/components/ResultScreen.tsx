import type { Question } from '../types';

interface Props {
  question: Question;
  result: 'correct' | 'wrong';
  onNext: () => void;
  onHome: () => void;
}

export default function ResultScreen({ question, result, onNext, onHome }: Props) {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto p-4 gap-4">
      {/* Result badge */}
      <div className={`text-center py-4 rounded-2xl ${
        result === 'correct'
          ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
          : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
      }`}>
        <div className="text-4xl mb-1">{result === 'correct' ? '○' : '×'}</div>
        <div className={`text-lg font-bold ${
          result === 'correct'
            ? 'text-green-700 dark:text-green-400'
            : 'text-red-700 dark:text-red-400'
        }`}>
          {result === 'correct' ? '正解！' : '不正解'}
        </div>
      </div>

      {/* Question recap */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-400 mb-1">問題</div>
        <p className="text-base">{question.ja}</p>
      </div>

      {/* Answer */}
      <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-700">
        <div className="text-xs text-amber-600 dark:text-amber-400 mb-2">解答</div>
        {question.type === 'fill' && question.blanks && (
          <>
            <div className="flex flex-wrap gap-2 mb-2">
              {question.blanks.map((b, i) => (
                <span key={i} className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-3 py-1 rounded-lg font-bold text-lg">
                  {b}
                </span>
              ))}
            </div>
            {question.fullText && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{question.fullText}</p>
            )}
          </>
        )}
        {question.type === 'compose' && question.answer && (
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{question.answer}</p>
        )}
      </div>

      {/* Explanation */}
      {question.exp && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 mb-2">解説</div>
          <div
            className="exp-content text-sm leading-relaxed text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: question.exp }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto pt-2">
        <button
          onClick={onHome}
          className="flex-none h-12 px-5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-medium text-sm transition-colors"
        >
          ホーム
        </button>
        <button
          onClick={onNext}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-semibold transition-colors"
        >
          次の問題へ →
        </button>
      </div>
    </div>
  );
}
