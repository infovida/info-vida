import { expect, test } from '@jest/globals';

import { createDemoQuizSession, demoQuizResult, isDemoQuizQuestion, reduceQuizSession } from '../src/domain/quizSession';
import { demoQuizCategories, demoQuizQuestions } from '../src/features/quiz/data/demoQuiz';
import { createDemoQuizRepository, decodeDemoQuiz } from '../src/features/quiz/demoQuizRepository';

const category = demoQuizCategories[0];
const pool = demoQuizQuestions.filter(q => category.questionIds.includes(q.id));

test('catálogo tem seis categorias válidas, dezoito IDs únicos e ordem editorial', async () => {
  const repository = createDemoQuizRepository();
  expect(await repository.categories()).toHaveLength(6);
  expect(await repository.questions()).toHaveLength(18);
  expect((await repository.questions(category.id)).map(q => q.id)).toEqual(category.questionIds);
  expect(await repository.questions('inexistente')).toEqual([]);
  const copy = await repository.questions(category.id);
  expect(copy[0].options).not.toBe(pool[0].options);
  expect(decodeDemoQuiz([], [])).toEqual({ categories: [], questions: [] });
});
test('recusa questões ambíguas/inválidas e catálogo com referências inconsistentes', () => {
  for (const value of [null, {}, { ...pool[0], options: ['a', 'a'] }, { ...pool[0], correctAnswer: 20 },
    { ...pool[0], isDemo: false }, { ...pool[0], explanation: '' }, { ...pool[0], contentVersion: '' }]) {
    expect(isDemoQuizQuestion(value)).toBe(false);
  }
  for (const [categories, questions] of [[{}, []], [[], {}], [[], demoQuizQuestions],
    [demoQuizCategories, [...demoQuizQuestions, demoQuizQuestions[0]]],
    [[{ ...category, questionIds: ['ausente'] }], pool],
    [[{ ...category, gradientColors: ['from-blue', 'to-cyan'] }], pool],
    [[{ ...category, questionIds: [pool[0].id, pool[0].id] }], pool],
    [[category, category], pool], [[null], []]]) {
    expect(() => decodeDemoQuiz(categories, questions)).toThrow();
  }
});
test('snapshot não muda com alterações no catálogo de origem e rejeita início vazio', () => {
  const mutable = pool.map(q => ({ ...q, options: [...q.options] }));
  const session = createDemoQuizSession('test', category, mutable, 'category');
  mutable[0].question = 'Alteração externa'; mutable[0].options[0] = 'Outra alternativa';
  expect(session.questions[0].question).toBe(pool[0].question);
  expect(session.questions[0].options[0]).toBe(pool[0].options[0]);
  expect(Object.isFrozen(session.questions[0].options)).toBe(true);
  expect(() => createDemoQuizSession('test', category, [], 'category')).toThrow();
  expect(() => createDemoQuizSession('test', category, [pool[0], pool[0]], 'category')).toThrow();
  expect(() => createDemoQuizSession('test', { ...category, questionIds: ['outra'] }, pool, 'category')).toThrow();
});
test('sorteia cinco perguntas únicas e respeita um catálogo menor sem alterar sua ordem', () => {
  const randomCategory = { ...category, id: 'aleatorio', questionIds: demoQuizQuestions.map(q => q.id) };
  const session = createDemoQuizSession('random', randomCategory, demoQuizQuestions, 'random', () => 0);
  expect(session.questions).toHaveLength(5);
  expect(new Set(session.questions.map(q => q.id)).size).toBe(5);
  expect(session.pool.map(q => q.id)).toEqual(demoQuizQuestions.map(q => q.id));
  const small = createDemoQuizSession('small', category, pool, 'random', () => 0);
  expect(small.questions).toHaveLength(3);
});
test('primeira resposta vence; avanço repetido ou sem resposta não pula questão', () => {
  let session = createDemoQuizSession('test', category, pool, 'category');
  const first = pool[0].id;
  expect(reduceQuizSession(session, { type: 'advance', questionId: first })).toBe(session);
  expect(reduceQuizSession(session, { type: 'answer', questionId: first, answer: -1 })).toBe(session);
  expect(reduceQuizSession(session, { type: 'answer', questionId: 'errada', answer: 0 })).toBe(session);
  session = reduceQuizSession(session, { type: 'answer', questionId: first, answer: pool[0].correctAnswer });
  expect(reduceQuizSession(session, { type: 'answer', questionId: first, answer: 0 })).toBe(session);
  session = reduceQuizSession(session, { type: 'advance', questionId: first });
  expect(session.index).toBe(1);
  expect(reduceQuizSession(session, { type: 'advance', questionId: first })).toBe(session);
  expect(demoQuizResult(session)).toBeNull();
});
test('resultado final trata zero, parcial e total sem eventos de XP nem recontagem', () => {
  for (const correct of [0, 1, 3]) {
    let session = createDemoQuizSession(`test-${correct}`, category, pool, 'category');
    for (let i = 0; i < pool.length; i++) {
      const question = pool[i];
      session = reduceQuizSession(session, { type: 'answer', questionId: question.id,
        answer: i < correct ? question.correctAnswer : (question.correctAnswer + 1) % question.options.length });
      session = reduceQuizSession(session, { type: 'advance', questionId: question.id });
    }
    expect(demoQuizResult(session)).toEqual({ correct, total: 3, percentage: Math.round(correct / 3 * 100) });
    expect(demoQuizResult(session)).toEqual(demoQuizResult(session));
    expect(reduceQuizSession(session, { type: 'advance', questionId: pool[2].id })).toBe(session);
    expect(session).not.toHaveProperty('earnedXp');
  }
});
