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
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Result indicator — top stripe */}
      <div className={`h-2 w-full ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />

      <div className="px-5 pt-6 pb-2">
        <span className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg ${
          isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400'
        }`}>
          {isCorrect ? '○ 正解' : '× 不正解'}
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 py-4 gap-5">
        {/* Question */}
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {question.ja}
          </p>
        </div>

        {/* Answer */}
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl">
          {question.type === 'fill' && question.blanks && (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {question.blanks.map((b, i) => (
                  <span
                    key={i}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold text-lg"
                  >
                    {b}
                  </span>
                ))}
              </div>
              {question.fullText && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{question.fullText}</p>
              )}
            </>
          )}
          {question.type === 'compose' && question.answer && (
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{question.answer}</p>
          )}
        </div>

        {/* Explanation */}
        {question.exp && (
          <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">
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
          className="h-12 px-4 text-sm font-medium text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          ← ホーム
        </button>
        <button
          onClick={onNext}
          className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
        >
          次の問題
        </button>
      </div>
    </div>
  );
}
