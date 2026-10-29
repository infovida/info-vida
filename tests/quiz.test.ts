import { expect, test } from '@jest/globals';

import { isCorrectAnswer, selectQuestions, type Question } from '../src/domain/quiz';

test('sorteio preserva catálogo, limita quantidade e não repete perguntas', () => {
  const catalog = ['a', 'b', 'c', 'd'];
  const selected = selectQuestions(catalog, 3, () => 0);
  expect(catalog).toEqual(['a', 'b', 'c', 'd']);
  expect(selected).toEqual(['b', 'c', 'd']);
  expect(new Set(selected).size).toBe(3);
  expect(selectQuestions(catalog, 10)).toHaveLength(4);
  expect(selectQuestions([], 5)).toEqual([]);
  expect(selectQuestions(catalog, 0)).toEqual([]);
});
test('rejeita quantidade e fonte de aleatoriedade inválidas', () => {
  for (const count of [-1, 1.5, NaN]) expect(() => selectQuestions([1, 2], count)).toThrow();
  for (const value of [-1, 1, NaN, Infinity]) expect(() => selectQuestions([1, 2], 1, () => value)).toThrow();
});
test('corrige apenas alternativas existentes e com índice inteiro', () => {
  const question: Question = { question: 'Pergunta de teste', options: ['A', 'B'], correctAnswer: 1,
    explanation: 'Explicação de teste', emoji: '' };
  expect(isCorrectAnswer(question, 1)).toBe(true);
  for (const answer of [0, -1, 2, 1.5, NaN]) expect(isCorrectAnswer(question, answer)).toBe(false);
});
