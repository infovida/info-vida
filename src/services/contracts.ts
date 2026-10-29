import type { QuizCategory, QuizQuestion } from '../domain/quiz';
import type { Reminder } from '../domain/reminders';

export type { QuizCategory, QuizQuestion } from '../domain/quiz';

/** Integration boundaries. No API provider or persistence engine is selected here. */
export interface Article {
  id: string; categoryId: string; title: string; summary: string; body: string[];
  sourceLabel: string; isDemo: boolean; publishedAt?: string; imageUrl?: string; imageAsset?: string;
}
export interface ArticlesRepository {
  list(options: { categoryId?: string }): Promise<readonly Article[]>;
  getById(id: string): Promise<Article | null>;
}
export interface QuizRepository {
  categories(): Promise<readonly QuizCategory[]>;
  questions(categoryId?: string): Promise<readonly QuizQuestion[]>;
}
export interface QuizAttempt {
  id: string; categoryId: string; mode: 'category' | 'random'; questionIds: string[];
  contentVersion: string; answers: Record<string, number>; correctCount: number;
  totalQuestions: number; earnedXp: number; completedAt: string; completedLocalDate: string;
}
export interface ReminderRepository {
  list(): Promise<readonly Reminder[]>;
  save(reminder: Reminder): Promise<void>;
  remove(id: string): Promise<void>;
}
export interface ProgressRepository {
  attempts(): Promise<readonly QuizAttempt[]>;
  /** Must be idempotent by attempt.id; demo attempts must not be submitted. */
  complete(attempt: QuizAttempt): Promise<void>;
  markArticleRead(articleId: string): Promise<void>;
}
export interface AppNotification {
  id: string; type: 'achievement' | 'information' | 'reminder'; title: string;
  message: string; createdAt: string; readAt?: string; isDemo: boolean;
  target?: { kind: 'article' | 'achievement' | 'reminder'; id: string };
}
export interface NotificationRepository {
  list(): Promise<readonly AppNotification[]>;
  markRead(ids: readonly string[]): Promise<void>;
}
