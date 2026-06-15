import { useState, useCallback, useRef } from 'react';
import type { Question, QuizFilter, SessionEntry } from './types';
import { selectNext, filterPool } from './lib/adaptive';
import { getAllHistory, recordResult, recordSession } from './lib/storage';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import StatsScreen from './components/StatsScreen';
import SessionResultScreen from './components/SessionResultScreen';
import questionsData from './data/questions.json';

const ALL_QUESTIONS = questionsData.questions as Question[];

type Screen = 'home' | 'quiz' | 'stats' | 'result';


export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(20);
  const recentIds = useRef<string[]>([]);
  const pool = useRef<Question[]>(ALL_QUESTIONS);
  const currentFilter = useRef<QuizFilter>({ mode: 'adaptive' });
  const sessionStartedAt = useRef<number>(0);
  const [showHint, setShowHint] = useState(() => localStorage.getItem('spanish_show_hint') !== 'false');
  const [verbHintAlwaysOpen, setVerbHintAlwaysOpen] = useState(() => localStorage.getItem('spanish_verb_hint_always_open') !== 'false');
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | 'skip' | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionEntry[]>([]);

  function toggleHint() {
    setShowHint(h => {
      const next = !h;
      localStorage.setItem('spanish_show_hint', String(next));
      return next;
    });
  }

  function toggleVerbHintAlwaysOpen() {
    setVerbHintAlwaysOpen(v => {
      const next = !v;
      localStorage.setItem('spanish_verb_hint_always_open', String(next));
      return next;
    });
  }

  const startQuiz = useCallback((f: QuizFilter) => {
    recentIds.current = [];
    setSessionHistory([]);
    currentFilter.current = f;
    sessionStartedAt.current = Date.now();

    let filtered = ALL_QUESTIONS;
    if (f.mode === 'chapter') {
      filtered = filterPool(ALL_QUESTIONS, {
        chapter: f.chapter,
        lesson: f.lesson,
      });
    } else if (f.mode === 'theme') {
      filtered = filterPool(ALL_QUESTIONS, { theme: f.theme });
    }

    if (filtered.length === 0) {
      alert('該当する問題がありません');
      return;
    }

    pool.current = filtered;
    setSessionIndex(0);
    setSessionTotal(f.count ?? 20);

    const history = getAllHistory();
    const q = selectNext(filtered, history, []);
    setCurrentQuestion(q);
    setScreen('quiz');
  }, []);

  function pickNext() {
    const history = getAllHistory();
    const q = selectNext(pool.current, history, recentIds.current);
    setCurrentQuestion(q);
  }

  function handleResult(result: 'correct' | 'wrong' | 'skip') {
    if (!currentQuestion) return;

    if (result !== 'skip') {
      recordResult(currentQuestion.id, result);
    }
    setSessionHistory(h => [...h, { question: currentQuestion, result }]);
    recentIds.current = [...recentIds.current, currentQuestion.id];
    setLastResult(result);
    const newIndex = sessionIndex + 1;
    setSessionIndex(newIndex);
    if (sessionTotal > 0 && newIndex >= sessionTotal) {
      const answered = [...sessionHistory, { question: currentQuestion, result }];
      const correct = answered.filter((e) => e.result === 'correct').length;
      recordSession(currentFilter.current, answered.length, correct, sessionStartedAt.current);
      setScreen('result');
      return;
    }
    pickNext();
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        questions={ALL_QUESTIONS}
        onStart={startQuiz}
        onStats={() => setScreen('stats')}
        showHint={showHint}
        onToggleHint={toggleHint}
        verbHintAlwaysOpen={verbHintAlwaysOpen}
        onToggleVerbHintAlwaysOpen={toggleVerbHintAlwaysOpen}
      />
    );
  }

  if (screen === 'stats') {
    return (
      <StatsScreen
        questions={ALL_QUESTIONS}
        onHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'result') {
    return (
      <SessionResultScreen
        records={sessionHistory}
        onHome={() => setScreen('home')}
      />
    );
  }

  function handleStop() {
    const answered = sessionHistory.filter(e => e.result !== 'skip');
    const correct = answered.filter(e => e.result === 'correct').length;
    recordSession(currentFilter.current, answered.length, correct, sessionStartedAt.current);
    setScreen('result');
  }

  if (screen === 'quiz' && currentQuestion) {
    return (
      <QuizScreen
        key={currentQuestion.id}
        question={currentQuestion}
        sessionIndex={sessionIndex}
        sessionTotal={sessionTotal}
        onResult={handleResult}
        onHome={() => setScreen('home')}
        onStop={handleStop}
        showHint={showHint}
        verbHintAlwaysOpen={verbHintAlwaysOpen}
        lastResult={lastResult}
        sessionHistory={sessionHistory}
      />
    );
  }

  return null;
}
