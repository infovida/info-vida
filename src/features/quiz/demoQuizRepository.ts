import type { QuizCategory, QuizQuestion } from '../../domain/quiz';
import { isDemoQuizQuestion } from '../../domain/quizSession';
import type { QuizRepository } from '../../services/contracts';
import { demoQuizCategories, demoQuizQuestions } from './data/demoQuiz';

export function decodeDemoQuiz(categories: unknown, questions: unknown) {
  if (!Array.isArray(categories) || !Array.isArray(questions) || !questions.every(isDemoQuizQuestion)) throw new Error('Catálogo inválido');
  const ids = new Set(questions.map(q => q.id));
  if (ids.size !== questions.length || new Set(questions.map(q => q.contentVersion)).size > 1) throw new Error('Perguntas inválidas');
  const categoryIds = new Set<string>(); const assigned = new Set<string>();
  const decoded: QuizCategory[] = categories.map((input: unknown) => {
    if (!input || typeof input !== 'object') throw new Error('Categoria inválida');
    const c = input as Record<string, unknown>;
    if (typeof c.id !== 'string' || !/^[a-z0-9-]+$/.test(c.id) || categoryIds.has(c.id)
      || typeof c.label !== 'string' || !c.label.trim() || typeof c.emoji !== 'string' || !c.emoji.trim()
      || !Array.isArray(c.gradientColors) || c.gradientColors.length < 2 || !c.gradientColors.every(v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v))
      || !Array.isArray(c.questionIds) || new Set(c.questionIds).size !== c.questionIds.length
      || !c.questionIds.every(id => typeof id === 'string' && ids.has(id) && !assigned.has(id))) throw new Error('Categoria inválida');
    categoryIds.add(c.id); c.questionIds.forEach(id => assigned.add(id));
    return { id: c.id, label: c.label, emoji: c.emoji, gradientColors: [...c.gradientColors], questionIds: [...c.questionIds] };
  });
  if (assigned.size !== ids.size) throw new Error('Perguntas sem categoria');
  return { categories: decoded, questions: questions.map(q => ({ ...q, options: [...q.options] })) as QuizQuestion[] };
}
export function createDemoQuizRepository(categories: unknown = demoQuizCategories, questions: unknown = demoQuizQuestions): QuizRepository {
  return {
    async categories() { return decodeDemoQuiz(categories, questions).categories; },
    async questions(categoryId) {
      const data = decodeDemoQuiz(categories, questions);
      if (!categoryId) return data.questions;
      const category = data.categories.find(c => c.id === categoryId);
      return category ? category.questionIds.map(id => data.questions.find(q => q.id === id)!) : [];
    },
  };
}
export const demoQuizRepository = createDemoQuizRepository();
