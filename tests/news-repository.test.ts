import { expect, test } from '@jest/globals';

import { DEMO_SOURCE, demoArticles } from '../src/features/news/data/demoArticles';
import { createDemoArticlesRepository, decodeDemoArticles } from '../src/features/news/demoArticlesRepository';

test('catálogo de demonstração possui IDs únicos, fonte fictícia e nenhum dado de campanha real', async () => {
  const repository = createDemoArticlesRepository();
  const all = await repository.list({});
  expect(all).toHaveLength(6);
  expect(new Set(all.map(a => a.id)).size).toBe(all.length);
  expect(all.every(a => a.isDemo && a.sourceLabel === DEMO_SOURCE && !a.publishedAt && !a.imageUrl)).toBe(true);
  const vaccination = await repository.list({ categoryId: 'vaccination' });
  expect(vaccination).toHaveLength(1);
  expect(vaccination[0].categoryId).toBe('vaccination');
  expect(await repository.list({ categoryId: 'all' })).toEqual(all);
  expect(await repository.list({ categoryId: 'emergency' })).toEqual([]);
  expect(await repository.getById('inexistente')).toBeNull();
});
test('leitura e lista compartilham conteúdo sem expor o catálogo a mutações', async () => {
  const repository = createDemoArticlesRepository();
  const all = await repository.list({});
  expect(await repository.getById(all[0].id)).toEqual(all[0]);
  all[0].body[0] = 'Alteração externa';
  expect((await repository.getById(all[0].id))?.body[0]).toBe(demoArticles[0].body[0]);
});
test('recusa versões incompletas, duplicadas e conteúdo real apresentado como exemplo', async () => {
  const article = demoArticles[0];
  for (const input of [null, {}, [null], [article, article], [{ ...article, id: '../outro' }],
    [{ ...article, categoryId: 'unknown' }], [{ ...article, title: ' ' }], [{ ...article, summary: '' }],
    [{ ...article, body: [] }], [{ ...article, body: [''] }], [{ ...article, sourceLabel: 'Fonte inventada' }],
    [{ ...article, isDemo: false }], [{ ...article, publishedAt: '2026-10-27' }],
    [{ ...article, imageUrl: 'https://example.com/image.png' }], [{ ...article, imageAsset: '' }]]) {
    expect(() => decodeDemoArticles(input)).toThrow();
  }
  expect(decodeDemoArticles([])).toEqual([]);
  await expect(createDemoArticlesRepository(null).list({})).rejects.toThrow();
});
