import { useState, useCallback, useRef } from 'react';
import type { Question, QuizFilter } from './types';
import { selectNext, filterPool } from './lib/adaptive';
import { getAllHistory, recordResult } from './lib/storage';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import StatsScreen from './components/StatsScreen';
import questionsData from './data/questions.json';

const ALL_QUESTIONS = questionsData.questions as Question[];

type Screen = 'home' | 'quiz' | 'result' | 'stats';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong'>('correct');
  const [sessionIndex, setSessionIndex] = useState(0);
  const sessionTotal = 20;
  const recentIds = useRef<string[]>([]);
  const pool = useRef<Question[]>(ALL_QUESTIONS);
  const [showHint, setShowHint] = useState(() => localStorage.getItem('spanish_show_hint') !== 'false');

  function toggleHint() {
    setShowHint(h => {
      const next = !h;
      localStorage.setItem('spanish_show_hint', String(next));
      return next;
    });
  }

  const startQuiz = useCallback((f: QuizFilter) => {
    recentIds.current = [];

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
      recentIds.current = [...recentIds.current, currentQuestion.id];
      setLastResult(result);
      setSessionIndex((i) => i + 1);
      setScreen('result');
    } else {
      recentIds.current = [...recentIds.current, currentQuestion.id];
      setSessionIndex((i) => i + 1);
      pickNext();
    }
  }

  function handleNext() {
    pickNext();
    setScreen('quiz');
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        questions={ALL_QUESTIONS}
        onStart={startQuiz}
        onStats={() => setScreen('stats')}
        showHint={showHint}
        onToggleHint={toggleHint}
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

  if (screen === 'quiz' && currentQuestion) {
    return (
      <QuizScreen
        key={currentQuestion.id}
        question={currentQuestion}
        sessionIndex={sessionIndex}
        sessionTotal={sessionTotal}
        onResult={handleResult}
        showHint={showHint}
      />
    );
  }

  if (screen === 'result' && currentQuestion) {
    return (
      <ResultScreen
        question={currentQuestion}
        result={lastResult}
        onNext={handleNext}
        onHome={() => setScreen('home')}
      />
    );
  }

  return null;
}
