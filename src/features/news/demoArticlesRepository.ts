import type { Article, ArticlesRepository } from '../../services/contracts';
import { newsCategories } from './data/categories';
import { DEMO_SOURCE, demoArticles } from './data/demoArticles';

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** The local demo adapter deliberately refuses real dates, remote images or invented sources. */
export function decodeDemoArticles(input: unknown): Article[] {
  if (!Array.isArray(input)) throw new Error('Exemplos inválidos');
  const ids = new Set<string>();
  return input.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Exemplo inválido');
    const a = item as Record<string, unknown>;
    if (!hasText(a.id) || !/^[a-z0-9-]+$/.test(a.id) || ids.has(a.id)
      || !hasText(a.categoryId) || !newsCategories.some(c => c.id !== 'all' && c.id === a.categoryId)
      || !hasText(a.title) || !hasText(a.summary) || !Array.isArray(a.body) || !a.body.length || !a.body.every(hasText)
      || a.sourceLabel !== DEMO_SOURCE || a.isDemo !== true || a.publishedAt !== undefined || a.imageUrl !== undefined
      || (a.imageAsset !== undefined && !hasText(a.imageAsset))) throw new Error('Exemplo inválido');
    ids.add(a.id);
    return { id: a.id, categoryId: a.categoryId, title: a.title, summary: a.summary, body: [...a.body],
      sourceLabel: DEMO_SOURCE, isDemo: true, ...(a.imageAsset ? { imageAsset: a.imageAsset as string } : {}) };
  });
}
export function createDemoArticlesRepository(source: unknown = demoArticles): ArticlesRepository {
  return {
    async list({ categoryId }) {
      return decodeDemoArticles(source).filter(article => !categoryId || categoryId === 'all' || article.categoryId === categoryId);
    },
    async getById(id) { return decodeDemoArticles(source).find(article => article.id === id) ?? null; },
  };
}
export const demoArticlesRepository = createDemoArticlesRepository();
