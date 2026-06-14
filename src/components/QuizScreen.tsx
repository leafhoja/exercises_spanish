import { useState } from 'react';
import type { Question, SessionEntry } from '../types';
import { extractVerbHints } from '../lib/parseExp';

function FullTextDisplay({ text }: { text: string }) {
  const parts = text.split(/(\(\([^)]+\)\))/g);
  return (
    <span>
      {parts.map((part, i) => {
        const match = part.match(/^\(\(([^)]+)\)\)$/);
        if (match) {
          return (
            <span key={i} className="font-bold text-zinc-900 dark:text-zinc-100">
              ({match[1]})
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function FillSentence({ spanish, blanks }: { spanish: string; blanks: string[] }) {
  const parts = spanish.split('(___)');
  return (
    <span className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide leading-loose">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < blanks.length && blanks[i].split(' ').map((_, wi) => (
            <span
              key={wi}
              className="inline-block w-10 border-b-2 border-zinc-500 dark:border-zinc-400 mx-0.5 align-text-bottom"
            />
          ))}
        </span>
      ))}
    </span>
  );
}

function AnswerBlock({ question }: { question: Question }) {
  return (
    <div className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      {question.type === 'fill' && question.blanks && (
        <div className="flex flex-wrap gap-2 mb-2">
          {question.blanks.flatMap((b, i) =>
            b.split(' ').map((word, wi) => (
              <span
                key={`${i}-${wi}`}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1 rounded text-lg font-bold"
              >
                {word}
              </span>
            ))
          )}
        </div>
      )}
      {question.type === 'fill' && question.fullText && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          <FullTextDisplay text={question.fullText} />
        </p>
      )}
      {question.type === 'compose' && question.answer && (
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{question.answer}</p>
      )}
    </div>
  );
}

function HistoryView({
  entries,
  idx,
  onNavigate,
  onClose,
}: {
  entries: SessionEntry[];
  idx: number;
  onNavigate: (i: number) => void;
  onClose: () => void;
}) {
  const entry = entries[idx];
  const { question, result } = entry;
  const verbHints = extractVerbHints(question.exp ?? '');
  const jaLen = question.ja.length;
  const questionTextSize = jaLen < 18 ? 'text-3xl' : jaLen < 30 ? 'text-2xl' : 'text-xl';

  return (
    <div className="min-h-dvh flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/60">
        <button
          onClick={onClose}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          ← 現在の問題へ
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(idx - 1)}
            disabled={idx === 0}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 transition-colors text-lg px-1"
          >
            ‹
          </button>
          <span className="text-xs text-zinc-400 tabular-nums">{idx + 1} / {entries.length}</span>
          <button
            onClick={() => onNavigate(idx + 1)}
            disabled={idx === entries.length - 1}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 transition-colors text-lg px-1"
          >
            ›
          </button>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <span>{question.chapter} L{question.lesson}</span>
        </span>
      </div>

      {/* Result badge */}
      <div className="px-5 pt-4">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
          result === 'correct'
            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
            : result === 'wrong'
            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
        }`}>
          {result === 'correct' ? '○ 正解' : result === 'wrong' ? '× 不正解' : 'スキップ'}
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-5 pt-4 pb-4 space-y-4">
        <p className={`${questionTextSize} font-bold leading-snug text-zinc-900 dark:text-zinc-100`}>
          {question.ja}
        </p>

        {/* Verb hints */}
        {verbHints.length > 0 && (
          <div className="flex flex-wrap gap-2">
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

        {/* Fill sentence (if applicable) */}
        {question.type === 'fill' && question.spanish && (
          <div className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <p className="text-xs text-zinc-400 mb-2 font-medium">空欄</p>
            <p className="leading-loose">
              <FillSentence spanish={question.spanish} blanks={question.blanks ?? []} />
            </p>
          </div>
        )}

        {/* Answer */}
        <AnswerBlock question={question} />

        {/* Explanation */}
        {question.exp && (
          <div className="px-4 py-3 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">解説</p>
            <div className="exp-content text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.exp }} />
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  question: Question;
  sessionIndex: number;
  sessionTotal: number;
  onResult: (result: 'correct' | 'wrong' | 'skip') => void;
  onHome: () => void;
  showHint: boolean;
  verbHintAlwaysOpen: boolean;
  lastResult: 'correct' | 'wrong' | 'skip' | null;
  sessionHistory: SessionEntry[];
}

export default function QuizScreen({ question, sessionIndex, sessionTotal, onResult, onHome, showHint, verbHintAlwaysOpen, lastResult, sessionHistory }: Props) {
  const [revealed, setReveal] = useState(false);
  const verbHints = extractVerbHints(question.exp ?? '');
  const [verbHintOpen, setVerbHintOpen] = useState(verbHintAlwaysOpen && verbHints.length > 0);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const progress = sessionTotal > 0 ? sessionIndex / sessionTotal : 0;
  const jaLen = question.ja.length;
  const questionTextSize = jaLen < 18 ? 'text-3xl' : jaLen < 30 ? 'text-2xl' : 'text-xl';

  if (historyIdx !== null && sessionHistory.length > 0) {
    return (
      <HistoryView
        entries={sessionHistory}
        idx={historyIdx}
        onNavigate={setHistoryIdx}
        onClose={() => setHistoryIdx(null)}
      />
    );
  }

  return (
    <div className="min-h-dvh flex flex-col max-w-lg mx-auto">
      {/* Progress bar - tap to review history */}
      {sessionTotal > 0 ? (
        <div className="flex w-full" style={{ gap: '1px' }}>
          {Array.from({ length: sessionTotal }).map((_, i) => {
            const entry = sessionHistory[i];
            const color = !entry
              ? 'bg-zinc-100 dark:bg-zinc-800'
              : entry.result === 'correct'
              ? 'bg-emerald-500'
              : entry.result === 'wrong'
              ? 'bg-rose-500'
              : 'bg-zinc-300 dark:bg-zinc-600';
            return (
              <div
                key={i}
                className={`flex-1 h-0.5 py-2 box-content transition-colors duration-300 ${color} ${entry ? 'cursor-pointer active:opacity-60' : ''}`}
                onClick={entry ? () => setHistoryIdx(i) : undefined}
              />
            );
          })}
        </div>
      ) : (
        <div
          className={`h-0.5 py-2 box-content bg-zinc-100 dark:bg-zinc-900 w-full ${sessionHistory.length > 0 ? 'cursor-pointer' : ''}`}
          onClick={sessionHistory.length > 0 ? () => setHistoryIdx(sessionHistory.length - 1) : undefined}
        >
          <div
            className={`h-0.5 transition-all duration-500 ${lastResult === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-900">
        <button
          onClick={onHome}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          ← ホーム
        </button>
        <span className="text-xs text-zinc-400 tabular-nums">{sessionIndex} / {sessionTotal === 0 ? '∞' : sessionTotal}</span>
        <span className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <span>{question.chapter} L{question.lesson}</span>
          {question.theme && (
            <span className="border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[11px]">
              {question.theme}
            </span>
          )}
          {question.isPredicted && (
            <span className="border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-[11px]">
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
        {verbHints.length > 0 && (
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
            <p className="leading-loose">
              <FillSentence spanish={question.spanish} blanks={question.blanks ?? []} />
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
            onClick={() => { setReveal(true); if (verbHints.length > 0) setVerbHintOpen(true); }}
            className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-base font-bold transition-colors shadow-sm active:shadow-none active:translate-y-px"
          >
            答えを見る
          </button>
        ) : (
          <>
            {/* Answer block */}
            <AnswerBlock question={question} />

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

        <div className={`flex pt-1 gap-2 ${sessionHistory.length > 0 ? 'justify-between' : 'justify-center'}`}>
          {sessionHistory.length > 0 && (
            <button
              onClick={() => setHistoryIdx(sessionHistory.length - 1)}
              className="text-sm text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              ← 前の問題
            </button>
          )}
          <button
            onClick={() => onResult('skip')}
            className="text-sm text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-6 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            スキップ
          </button>
        </div>
      </div>
    </div>
  );
}
