// Types for Translation Challenge API responses

export interface VocabularyItem {
  word: string;
  type: string;
  translation: string;
}

export interface Lesson {
  goal: string;
  tense: string;
  vietnameseText: string;
  englishText: string;
  newVocabulary: VocabularyItem[];
  reviewVocabulary: string[];
}

export interface DayChallenge {
  day: number;
  goal: string;
  tense: string;
  vietnameseText: string;
  englishText: string;
  newVocabulary: VocabularyItem[];
  reviewVocabulary: string[];
}

export interface Schedule {
  days: DayChallenge[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

