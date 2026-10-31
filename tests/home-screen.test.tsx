import { describe, it } from '@jest/globals';
import { fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

import { appRoutes as routes } from './helpers/appRoutes';

describe('fundação e navegação InfoVida', () => {
  it('abre o início, navega pelas cinco abas e retorna sem duplicar a barra', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    expect(screen.getByText('InfoVida')).toBeTruthy();
    expect(screen.getByText('Acesse os conteúdos sem criar conta')).toBeTruthy();
    expect(screen.queryByRole('tab')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Começar' }));
    expect(testRouter.canGoBack()).toBe(false);
    expect(screen.getByText('Demonstração — notícias fictícias')).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();
    for (const [tab, heading] of [['Quiz', 'Quiz InfoVida'], ['Lembretes', 'Lembretes de Medicamentos'],
      ['Emergência', 'Emergências'], ['Perfil', 'Bem-vindo, visitante'], ['Início', 'InfoVida']]) {
      await fireEvent.press(screen.getByRole('tab', { name: tab }));
      expect(screen.getByRole('tab', { name: tab })).toBeSelected();
      expect(await screen.findByText(heading)).toBeTruthy();
      expect(screen.getAllByRole('tab')).toHaveLength(5);
    }
    await fireEvent.press(screen.getByRole('button', { name: 'Aprenda com o Quiz' }));
    expect(screen.getByRole('tab', { name: 'Quiz' })).toBeSelected();
  });
  it('abre perfil pelo cabeçalho e mantém retorno e rota inválida recuperáveis', async () => {
    await renderRouter(routes, { initialUrl: '/home' });
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir perfil' }));
    expect(screen.getByText('Bem-vindo, visitante')).toBeTruthy();
    await testRouter.back('/home');
    expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();
  });
  it('recupera um link inexistente sem tela em branco', async () => {
    await renderRouter(routes, { initialUrl: '/inexistente' });
    expect(screen.getByText('Página não encontrada')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(screen.getByText('InfoVida')).toBeTruthy();
  });
});
