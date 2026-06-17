export type QuestionType = 'fill' | 'compose';
export type QuestionSource = 'quiz' | 'kakomon' | 'predicted';

export interface Question {
  id: string;
  chapter: string;  // "1列" | "2列"
  lesson: number;
  theme: string;
  ja: string;
  type: QuestionType;
  source: QuestionSource;
  exp?: string;
  // fill type
  spanish?: string;
  blanks?: string[];
  fullText?: string;
  // compose type
  answer?: string;
}

export interface QuestionHistory {
  totalAttempts: number;
  wrongCount: number;
  lastSeenAt: number;
  lastResult: 'correct' | 'wrong';
  recentResults: ('correct' | 'wrong')[];
}

export interface DaySession {
  date: string;  // "YYYY-MM-DD"
  count: number;
  correct: number;
}

export interface StorageData {
  version: number;
  history: Record<string, QuestionHistory>;
  sessions: DaySession[];
  sessionLogs?: SessionLog[];
}

export type QuizMode = 'adaptive' | 'chapter' | 'theme';

export interface QuizFilter {
  mode: QuizMode;
  chapter?: string;
  lesson?: number;
  theme?: string;
  count?: number; // 0 = unlimited
  sources?: QuestionSource[]; // undefined = all
}

export interface LastFilterState {
  mode: QuizMode;
  selectedChapter: string;
  selectedLesson: number | null;
  selectedTheme: string;
  questionCount: number;
  selectedSources: QuestionSource[];
}

export interface SessionEntry {
  question: Question;
  result: 'correct' | 'wrong' | 'skip';
}

export interface SessionLog {
  id: string;
  startedAt: number;
  filter: QuizFilter;
  total: number;
  correct: number;
}
