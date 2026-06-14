import type { SessionEntry } from '../App';

interface WeakArea {
  label: string;
  wrong: number;
  total: number;
}

function computeWeakAreas(records: SessionEntry[]) {
  const byTheme: Record<string, WeakArea> = {};
  const byLesson: Record<string, WeakArea> = {};

  for (const r of records) {
    if (r.result === 'skip') continue;
    const { question: q, result } = r;

    if (q.theme) {
      byTheme[q.theme] ??= { label: q.theme, wrong: 0, total: 0 };
      byTheme[q.theme].total++;
      if (result === 'wrong') byTheme[q.theme].wrong++;
    }

    const lKey = `${q.chapter}-L${q.lesson}`;
    byLesson[lKey] ??= { label: `${q.chapter} L${q.lesson}`, wrong: 0, total: 0 };
    byLesson[lKey].total++;
    if (result === 'wrong') byLesson[lKey].wrong++;
  }

  const sortWrong = (a: WeakArea, b: WeakArea) =>
    b.wrong - a.wrong || b.wrong / b.total - a.wrong / a.total;

  const weakThemes = Object.values(byTheme).filter(x => x.wrong > 0).sort(sortWrong).slice(0, 4);
  const weakLessons = Object.values(byLesson).filter(x => x.wrong > 0).sort(sortWrong).slice(0, 4);

  return weakThemes.length > 0 ? weakThemes : weakLessons;
}

interface Props {
  records: SessionEntry[];
  onHome: () => void;
}

export default function SessionResultScreen({ records, onHome }: Props) {
  const answered = records.filter(r => r.result !== 'skip');
  const correct = answered.filter(r => r.result === 'correct').length;
  const total = answered.length;
  const skipped = records.length - total;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
  const weakAreas = computeWeakAreas(records);

  const rateColor =
    rate >= 80 ? 'text-blue-500' :
    rate >= 60 ? 'text-amber-500' :
    'text-rose-500';

  const barColor =
    rate >= 80 ? 'bg-blue-500' :
    rate >= 60 ? 'bg-amber-500' :
    'bg-rose-500';

  return (
    <div className="min-h-dvh flex flex-col max-w-lg mx-auto px-5 pt-12 pb-10">
      <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-8">セッション終了</h1>

      {/* Correct rate */}
      <div className="mb-8">
        <div className="flex items-end gap-2 mb-3">
          <span className={`text-6xl font-black tabular-nums ${rateColor}`}>{rate}%</span>
          <span className="text-zinc-400 text-sm mb-2 tabular-nums">
            {correct} / {total} 問正解{skipped > 0 && `（${skipped} スキップ）`}
          </span>
        </div>
        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">苦手な箇所</p>
          <div className="space-y-2">
            {weakAreas.map(area => {
              const wrongRate = Math.round((area.wrong / area.total) * 100);
              return (
                <div
                  key={area.label}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60"
                >
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{area.label}</span>
                  <span className="text-sm tabular-nums text-rose-500 font-semibold">
                    {area.total}問中{area.wrong}問不正解（{wrongRate}%）
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {weakAreas.length === 0 && total > 0 && (
        <div className="mb-8 px-4 py-3 rounded-lg border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40">
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">苦手な箇所なし — 完璧です！</p>
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={onHome}
          className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-base font-bold transition-colors"
        >
          ホームへ戻る
        </button>
      </div>
    </div>
  );
}
