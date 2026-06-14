export type QuestionType = 'fill' | 'compose';

export interface Question {
  id: string;
  chapter: string;  // "1列" | "2列"
  lesson: number;
  theme: string;
  ja: string;
  type: QuestionType;
  isPredicted: boolean;
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
}

export type QuizMode = 'adaptive' | 'chapter' | 'theme';

export interface QuizFilter {
  mode: QuizMode;
  chapter?: string;
  lesson?: number;
  theme?: string;
}
