import { isCorrectAnswer, selectQuestions, type QuizCategory, type QuizQuestion } from './quiz';

export function isDemoQuizQuestion(value: unknown): value is QuizQuestion {
  if (!value || typeof value !== 'object') return false;
  const q = value as Record<string, unknown>;
  const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
  return text(q.id) && /^[a-z0-9-]+$/.test(q.id) && text(q.contentVersion) && q.isDemo === true
    && text(q.question) && text(q.explanation) && text(q.emoji)
    && Array.isArray(q.options) && q.options.length >= 2 && q.options.length <= 6
    && q.options.every(text) && new Set(q.options.map(v => v.trim())).size === q.options.length
    && Number.isInteger(q.correctAnswer) && (q.correctAnswer as number) >= 0 && (q.correctAnswer as number) < q.options.length;
}
export interface DemoQuizSession {
  readonly id: string; readonly mode: 'category' | 'random'; readonly category: QuizCategory;
  readonly questions: readonly QuizQuestion[]; readonly pool: readonly QuizQuestion[];
  readonly answers: readonly (number | null)[]; readonly index: number; readonly phase: 'questions' | 'result';
}
export function createDemoQuizSession(id: string, category: QuizCategory, pool: readonly QuizQuestion[], mode: 'category' | 'random', random = Math.random): DemoQuizSession {
  if (!id.trim() || !category.id.trim() || !category.label.trim() || !category.emoji.trim()
    || category.gradientColors.length < 2 || !category.gradientColors.every(color => /^#[0-9a-f]{6}$/i.test(color))
    || category.questionIds.length !== pool.length || !category.questionIds.every((qid, index) => qid === pool[index]?.id)
    || !pool.length || !pool.every(isDemoQuizQuestion) || new Set(pool.map(q => q.id)).size !== pool.length
    || new Set(pool.map(q => q.contentVersion)).size !== 1) throw new Error('Rodada inválida');
  const frozen = Object.freeze(pool.map(q => Object.freeze({ ...q, options: Object.freeze([...q.options]) })));
  const questions = Object.freeze(mode === 'random' ? selectQuestions(frozen, 5, random) : [...frozen]);
  return Object.freeze({ id, mode, category: Object.freeze({ ...category, gradientColors: Object.freeze([...category.gradientColors]), questionIds: Object.freeze([...category.questionIds]) }),
    pool: frozen, questions, answers: Object.freeze(questions.map(() => null)), index: 0, phase: 'questions' });
}
export type QuizSessionAction = { type: 'answer'; questionId: string; answer: number } | { type: 'advance'; questionId: string };
export function reduceQuizSession(session: DemoQuizSession, action: QuizSessionAction): DemoQuizSession {
  const question = session.questions[session.index];
  if (session.phase !== 'questions' || !question || question.id !== action.questionId) return session;
  if (action.type === 'answer') {
    if (session.answers[session.index] !== null || !Number.isInteger(action.answer) || action.answer < 0 || action.answer >= question.options.length) return session;
    const answers = [...session.answers]; answers[session.index] = action.answer;
    return { ...session, answers: Object.freeze(answers) };
  }
  if (session.answers[session.index] === null) return session;
  return session.index < session.questions.length - 1 ? { ...session, index: session.index + 1 } : { ...session, phase: 'result' };
}
export function demoQuizResult(session: DemoQuizSession) {
  if (session.phase !== 'result' || !session.questions.length || session.answers.some(answer => answer === null)) return null;
  const correct = session.questions.reduce((count, question, index) => count + Number(isCorrectAnswer(question, session.answers[index]!)), 0);
  return { correct, total: session.questions.length, percentage: Math.round(correct / session.questions.length * 100) };
}
