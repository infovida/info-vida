import { describe, it, jest } from '@jest/globals';
import { act, fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';
import { router } from 'expo-router';

import { demoQuizCategories, demoQuizQuestions } from '../src/features/quiz/data/demoQuiz';
import { QuizCategoriesScreen } from '../src/features/quiz/QuizCategoriesScreen';
import type { QuizRepository } from '../src/services/contracts';
import { appRoutes } from './helpers/appRoutes';

const category = demoQuizCategories[0];
const questions = category.questionIds.map(id => demoQuizQuestions.find(q => q.id === id)!);
async function startCategory() {
  const app = await renderRouter(appRoutes, { initialUrl: '/quiz' });
  await screen.findByRole('button', { name: `Quiz de ${category.label}` });
  await fireEvent.press(screen.getByRole('button', { name: `Quiz de ${category.label}` }));
  await screen.findByText(questions[0].question);
  return app;
}
describe('categorias e rodada de demonstração', () => {
  it('mostra seis categorias, contagens reais e indisponibilidade de progresso sem inventar sequência', async () => {
    await renderRouter(appRoutes, { initialUrl: '/quiz' });
    for (const item of demoQuizCategories) await screen.findByRole('button', { name: `Quiz de ${item.label}` });
    expect(screen.getAllByText('3 perguntas')).toHaveLength(6);
    expect(screen.getByText('Progresso indisponível')).toBeTruthy();
    expect(screen.queryByText('7 dias consecutivos')).toBeNull();
    expect(screen.getByText('5 perguntas de todas as categorias')).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });
  it('histórico vazio conhecido mostra zero; categorias vazias desabilitam início', async () => {
    const repository: QuizRepository = { categories: async () => demoQuizCategories.map(c => ({ ...c, questionIds: [] })), questions: async () => [] };
    await renderRouter({ ...appRoutes, '(tabs)/quiz': () => <QuizCategoriesScreen repository={repository} activity={{ status: 'ready', dates: [] }} /> }, { initialUrl: '/quiz' });
    const button = await screen.findByRole('button', { name: `Quiz de ${category.label}` });
    expect(button).toBeDisabled(); expect(screen.getByRole('button', { name: 'Quiz Aleatório' })).toBeDisabled();
    expect(screen.getByText('0 dias seguidos')).toBeTruthy();
    await fireEvent.press(button);
    expect(screen.queryByText(questions[0].question)).toBeNull();
  });
  it('catálogo vazio oferece início e erro de leitura permite tentar novamente', async () => {
    const categories = jest.fn<QuizRepository['categories']>().mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue([]);
    const repository = { categories, questions: async () => [] };
    await renderRouter({ ...appRoutes, '(tabs)/quiz': () => <QuizCategoriesScreen repository={repository} /> }, { initialUrl: '/quiz' });
    await screen.findByText('Não foi possível carregar o Quiz');
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByText('Nenhuma categoria disponível');
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();
  });
  it('responde uma vez por pergunta, conclui, repete com novo ID e não concede XP', async () => {
    const app = await startCategory();
    const initialSessionId = app.getSearchParams().sessionId;
    expect(screen.getByRole('progressbar', { name: 'Perguntas respondidas' })).toHaveAccessibilityValue({ now: 0 });
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await fireEvent.press(screen.getByRole('button', { name: q.options[q.correctAnswer] }));
      const correct = screen.getByRole('button', { name: `${q.options[q.correctAnswer]}, resposta correta` });
      expect(correct).toBeDisabled(); await fireEvent.press(correct);
      await fireEvent.press(screen.getByRole('button', { name: i < questions.length - 1 ? 'Próxima pergunta' : 'Ver resultado' }));
    }
    await screen.findByText('100% de acertos');
    expect(screen.getByText('3 de 3')).toBeTruthy();
    expect(screen.getByText('Resultado de demonstração — progresso não salvo')).toBeTruthy();
    expect(screen.queryByText('Sair do quiz?')).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    await fireEvent.press(screen.getByRole('button', { name: 'Repetir' }));
    await screen.findByText(questions[0].question);
    expect(app.getSearchParams().sessionId).not.toBe(initialSessionId);
    await fireEvent.press(screen.getByRole('button', { name: 'Sair do quiz' }));
    await screen.findByText('Escolha uma categoria para começar');
  });
  it('X, Back e mudança de aba confirmam descarte e permitem continuar a rodada', async () => {
    await startCategory();
    await fireEvent.press(screen.getByRole('button', { name: questions[0].options[questions[0].correctAnswer] }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sair do quiz' }));
    await screen.findByText('Sair do quiz?');
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar quiz' }));
    expect(screen.getByRole('button', { name: 'Próxima pergunta' })).toBeTruthy();
    await act(() => router.back());
    await screen.findByText('Sair do quiz?');
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar quiz' }));
    await fireEvent.press(screen.getByRole('tab', { name: 'Início' }));
    await screen.findByText('Sair do quiz?');
    await fireEvent.press(screen.getByRole('button', { name: 'Sair' }));
    await screen.findByText('Notícias de exemplo');
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });
  it('aleatório abre cinco perguntas e links sem rodada ou resultado oferecem recuperação', async () => {
    await renderRouter(appRoutes, { initialUrl: '/quiz' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Quiz Aleatório' }));
    await screen.findByText('Questão 1 de 5');
    await fireEvent.press(screen.getByRole('button', { name: 'Sair do quiz' }));
    await testRouter.push('/quiz/session');
    await screen.findByText('Rodada não disponível');
    await fireEvent.press(screen.getByRole('button', { name: 'Categorias' }));
    await testRouter.push('/quiz/result/inexistente');
    await screen.findByText('Resultado não disponível');
    await fireEvent.press(screen.getByRole('button', { name: 'Categorias' }));
    expect(screen.getByRole('tab', { name: 'Quiz' })).toBeSelected();
  });
});
