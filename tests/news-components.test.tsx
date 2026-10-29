import { describe, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ArticleCard } from '../src/features/news/ArticleCard';
import { demoArticles } from '../src/features/news/data/demoArticles';
import { ArticleCover, NewsHeader } from '../src/features/news/NewsComponents';

describe('apresentação de notícias', () => {
  it('capa local tem alternativa se o carregamento falhar ou a chave não existir', async () => {
    const view = await render(<ArticleCover asset="community" />);
    await fireEvent(screen.getByRole('image', { name: 'Ilustração de demonstração' }), 'error', { nativeEvent: { error: 'Unavailable' } });
    expect(screen.getByText('Imagem indisponível')).toBeTruthy();
    await view.rerender(<ArticleCover asset="unknown" />);
    expect(screen.getByText('Imagem indisponível')).toBeTruthy();
  });
  it('card inteiro e Ler mais compartilham uma única ação acessível', async () => {
    const open = jest.fn();
    await render(<ArticleCard article={demoArticles[0]} onOpen={open} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: `Ler artigo: ${demoArticles[0].title}` }));
    expect(open).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Exemplo fictício')).toBeTruthy();
  });
  it('marca textual e acesso ao visitante permanecem se o logo falhar', async () => {
    const profile = jest.fn();
    await render(<NewsHeader onProfile={profile} />);
    await fireEvent(screen.getByRole('image', { name: 'PET-TECHSUS' }), 'error', { nativeEvent: { error: 'Unavailable' } });
    expect(screen.getByText('InfoVida')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir perfil' }));
    expect(profile).toHaveBeenCalledTimes(1);
  });
});
