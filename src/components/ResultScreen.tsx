import type { Question } from '../types';

interface Props {
  question: Question;
  result: 'correct' | 'wrong';
  onNext: () => void;
  onHome: () => void;
}

export default function ResultScreen({ question, result, onNext, onHome }: Props) {
  const isCorrect = result === 'correct';

  return (
    <div className="min-h-dvh flex flex-col max-w-lg mx-auto">
      {/* Result indicator — top stripe */}
      <div className={`h-2 w-full ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      <div className="px-5 pt-6 pb-2">
        <span className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg ${
          isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
        }`}>
          {isCorrect ? '○ 正解' : '× 不正解'}
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 py-4 gap-5">
        {/* Question */}
        <p className="text-xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
          {question.ja}
        </p>

        {/* Answer */}
        <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-xl">
          {question.type === 'fill' && question.blanks && (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {question.blanks.map((b, i) => (
                  <span
                    key={i}
                    className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 py-1 rounded-lg font-bold text-lg"
                  >
                    {b}
                  </span>
                ))}
              </div>
              {question.fullText && (
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">{question.fullText}</p>
              )}
            </>
          )}
          {question.type === 'compose' && question.answer && (
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{question.answer}</p>
          )}
        </div>

        {/* Explanation */}
        {question.exp && (
          <div className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-600 uppercase tracking-wider mb-2">
              解説
            </p>
            <div
              className="exp-content"
              dangerouslySetInnerHTML={{ __html: question.exp }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-8 flex gap-3">
        <button
          onClick={onHome}
          className="h-12 px-4 text-sm font-medium text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          ← ホーム
        </button>
        <button
          onClick={onNext}
          className="flex-1 h-12 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 active:bg-stone-950 dark:active:bg-stone-300 text-white dark:text-stone-900 rounded-xl font-bold transition-colors"
        >
          次の問題
        </button>
      </div>
    </div>
  );
}
