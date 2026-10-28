export type Locale = 'en' | 'fa';
export type LearningLevel = 'junior' | 'mid' | 'senior';
export type ThemeMode = 'light' | 'dark';

export interface UserSettings {
  locale: Locale;
  level: LearningLevel;
  reduceMotion: boolean;
  theme: ThemeMode;
  userId: string;
}

export interface CategoryDto {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
}

export interface PatternSummaryDto {
  id: string;
  categoryId: string;
  name: Record<string, string>;
  intent: Record<string, string>;
  tagline: Record<string, string>;
  hasAdvancedUnlock: boolean;
}

export interface LevelTextDto {
  body: Record<string, string>;
  code?: string | null;
  codeWalkthrough?: Record<string, string> | null;
}

export interface LearnSectionDto {
  id: string;
  title: Record<string, string>;
  byLevel: Record<string, LevelTextDto>;
}

export interface QuizQuestionDto {
  id: string;
  level: string;
  kind: string;
  prompt: Record<string, string>;
  options: Record<string, string[]>;
  correctIndex: number;
  explanation: Record<string, string>;
  xpReward: number;
  requiresUnlock?: boolean;
}

export interface PatternDetailDto {
  id: string;
  categoryId: string;
  name: Record<string, string>;
  intent: Record<string, string>;
  tagline: Record<string, string>;
  sections: LearnSectionDto[];
  exercises: QuizQuestionDto[];
  similarPatternIds: string[];
  hasAdvancedUnlock: boolean;
}

export interface CatalogResponse {
  categories: CategoryDto[];
  patterns: PatternSummaryDto[];
}

export interface AchievementDto {
  id: string;
  unlockedAt: string;
}

export interface ProgressSnapshotDto {
  userId: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate?: string | null;
  completedLessons: string[];
  completedExercises: string[];
  patternScores: Record<string, number>;
  achievements: AchievementDto[];
  unlocks: string[];
  xpToNextLevel: number;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  xpAwarded: number;
  explanationLocaleKey: string;
  progress: ProgressSnapshotDto;
  explanation: Record<string, string>;
}

export type ArenaMode = 'blocks' | 'code' | 'refactor' | 'quiz';
export type ArenaRelation = 'creates' | 'implements' | 'notifies' | 'wraps' | 'extends' | 'uses';

export interface CompleteArenaResponse {
  accepted: boolean;
  xpAwarded: number;
  progress: ProgressSnapshotDto;
  feedback: Record<string, string>;
}
