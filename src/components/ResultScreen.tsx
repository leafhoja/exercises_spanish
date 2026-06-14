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
      {/* Result stripe */}
      <div className={`h-1.5 w-full ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      <div className="px-5 pt-5 pb-2">
        <span className={`text-sm font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'}`}>
          {isCorrect ? '○ 正解' : '× 不正解'}
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 py-4 gap-5">
        {/* Question */}
        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
          {question.ja}
        </p>

        {/* Answer */}
        <div className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          {question.type === 'fill' && question.blanks && (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {question.blanks.map((b, i) => (
                  <span
                    key={i}
                    className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1 rounded font-bold text-lg"
                  >
                    {b}
                  </span>
                ))}
              </div>
              {question.fullText && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">{question.fullText}</p>
              )}
            </>
          )}
          {question.type === 'compose' && question.answer && (
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{question.answer}</p>
          )}
        </div>

        {/* Explanation */}
        {question.exp && (
          <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-2">解説</p>
            <div className="exp-content" dangerouslySetInnerHTML={{ __html: question.exp }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-8 flex gap-3">
        <button
          onClick={onHome}
          className="h-12 px-4 text-sm font-medium text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          ← ホーム
        </button>
        <button
          onClick={onNext}
          className="flex-1 h-12 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-bold transition-colors shadow-sm active:shadow-none active:translate-y-px"
        >
          次の問題
        </button>
      </div>
    </div>
  );
}
