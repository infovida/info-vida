import { describe, it, jest } from '@jest/globals';
import { act, fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

import { ArticleScreen } from '../src/features/news/ArticleScreen';
import { demoArticles } from '../src/features/news/data/demoArticles';
import { demoArticlesRepository } from '../src/features/news/demoArticlesRepository';
import { NewsScreen } from '../src/features/news/NewsScreen';
import type { Article, ArticlesRepository } from '../src/services/contracts';
import { appRoutes } from './helpers/appRoutes';

describe('feed fictício e leitura com navegação real', () => {
  it('filtra, abre artigo e retorna à mesma categoria sem transformar leitura demo em progresso', async () => {
    await renderRouter(appRoutes, { initialUrl: '/home' });
    await screen.findByText(demoArticles[0].title);
    expect(screen.getByText('Demonstração — notícias fictícias')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Nutrição' }));
    const article = demoArticles.find(a => a.categoryId === 'nutrition')!;
    await screen.findByText(article.title);
    expect(screen.queryByText(demoArticles[0].title)).toBeNull();
    await fireEvent.scroll(screen.getByTestId('news-list'), { nativeEvent: { contentOffset: { x: 0, y: 120 } } });
    await fireEvent.press(screen.getByRole('button', { name: `Ler artigo: ${article.title}` }));
    await screen.findByText('Conteúdo fictício para demonstração');
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.getByText(article.body[0])).toBeTruthy();
    expect(screen.queryByText('Concluir leitura')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByRole('button', { name: 'Nutrição' })).toBeSelected();
    expect(screen.getByText(article.title)).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });
  it('categoria vazia conserva indicação fictícia e oferece recuperação para Todos', async () => {
    await renderRouter(appRoutes, { initialUrl: '/home' });
    await screen.findByText(demoArticles[0].title);
    await fireEvent.press(screen.getByRole('button', { name: 'Infância' }));
    await screen.findByText('Nenhum exemplo nesta categoria');
    expect(screen.getByText('Demonstração — notícias fictícias')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Ver todos' }));
    await screen.findByText(demoArticles[0].title);
    expect(screen.getByRole('button', { name: 'Todos' })).toBeSelected();
  });
  it('recupera falha de repositório sem inventar notícias nem esconder aviso', async () => {
    const list = jest.fn<ArticlesRepository['list']>().mockRejectedValueOnce(new Error('Unreadable')).mockResolvedValue(demoArticles);
    const repository = { ...demoArticlesRepository, list };
    await renderRouter({ ...appRoutes, '(tabs)/home': () => <NewsScreen repository={repository} /> }, { initialUrl: '/home' });
    await screen.findByText('Não foi possível carregar os exemplos');
    expect(screen.queryByText(demoArticles[0].title)).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByText(demoArticles[0].title);
    expect(list).toHaveBeenCalledTimes(2);
  });
  it('ignora resposta antiga quando filtro muda antes do carregamento terminar', async () => {
    let resolveAll!: (value: readonly Article[]) => void;
    let resolveVaccination!: (value: readonly Article[]) => void;
    const repository: ArticlesRepository = {
      getById: demoArticlesRepository.getById,
      list: ({ categoryId }) => new Promise(resolve => {
        if (categoryId === 'all') resolveAll = resolve;
        else resolveVaccination = resolve;
      }),
    };
    await renderRouter({ ...appRoutes, '(tabs)/home': () => <NewsScreen repository={repository} /> }, { initialUrl: '/home' });
    expect(screen.getByRole('progressbar', { name: 'Carregando exemplos…' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Vacinação' }));
    const vaccination = demoArticles.filter(a => a.categoryId === 'vaccination');
    await act(() => resolveVaccination(vaccination));
    await screen.findByText(vaccination[0].title);
    await act(() => resolveAll(demoArticles));
    expect(screen.queryByText(demoArticles[0].title)).toBeNull();
    expect(screen.getByRole('button', { name: 'Vacinação' })).toBeSelected();
  });
  it('acesso direto a artigo sem histórico volta ao início e ID inválido tem recuperação', async () => {
    await renderRouter(appRoutes, { initialUrl: `/articles/${demoArticles[0].id}` });
    await screen.findByText(demoArticles[0].body[0]);
    expect(testRouter.canGoBack()).toBe(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    await screen.findByText('Notícias de exemplo');
    await testRouter.push('/articles/inexistente');
    await screen.findByText('Artigo não encontrado');
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(screen.getByText('Notícias de exemplo')).toBeTruthy();
  });
});

describe('recuperação da leitura', () => {
  it('permite repetir a leitura após falha sem exigir retorno ao feed', async () => {
    const getById = jest.fn<ArticlesRepository['getById']>().mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue(demoArticles[0]);
    const repository = { ...demoArticlesRepository, getById };
    await renderRouter({ ...appRoutes, 'articles/[id]': () => <ArticleScreen id={demoArticles[0].id} repository={repository} /> }, { initialUrl: `/articles/${demoArticles[0].id}` });
    await screen.findByText('Não foi possível carregar o artigo');
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByText(demoArticles[0].body[0]);
    expect(getById).toHaveBeenCalledTimes(2);
  });
  it('não consulta o repositório se a identificação do artigo estiver ausente', async () => {
    const getById = jest.fn<ArticlesRepository['getById']>().mockResolvedValue(null);
    await renderRouter({ ...appRoutes, 'articles/[id]': () => <ArticleScreen id="" repository={{ ...demoArticlesRepository, getById }} /> }, { initialUrl: '/articles/invalido' });
    await screen.findByText('Artigo não encontrado');
    expect(getById).not.toHaveBeenCalled();
  });
  it('botão Voltar nativo conserva a categoria e o destaque continua abrindo Quiz', async () => {
    await renderRouter(appRoutes, { initialUrl: '/home' });
    await screen.findByText(demoArticles[0].title);
    await fireEvent.press(screen.getByRole('button', { name: 'Vacinação' }));
    const article = demoArticles.find(a => a.categoryId === 'vaccination')!;
    await screen.findByText(article.title);
    await fireEvent.press(screen.getByRole('button', { name: `Ler artigo: ${article.title}` }));
    await screen.findByText(article.body[0]);
    await testRouter.back('/home');
    expect(screen.getByRole('button', { name: 'Vacinação' })).toBeSelected();
    await fireEvent.press(screen.getByRole('button', { name: 'Aprenda com o Quiz' }));
    expect(screen.getByRole('tab', { name: 'Quiz' })).toBeSelected();
  });
});
