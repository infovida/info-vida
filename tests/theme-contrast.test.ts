import { expect, test } from '@jest/globals';

import { demoQuizCategories } from '../src/features/quiz/data/demoQuiz';
import { colors, gradients } from '../src/theme/tokens';

function rgb(hex: string) { return [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)); }
function luminance(channels: number[]) {
  const linear = channels.map(channel => { const s = channel / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(a: number[], b: number[]) { const x = luminance(a); const y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

test('texto de leitura, avisos e seleção possuem contraste AA com suas superfícies', () => {
  for (const [text, background] of [[colors.body, colors.background], [colors.muted, colors.surface],
    [colors.primary, colors.softBlue], [colors.success, colors.successSoft], [colors.warning, colors.warningSoft],
    [colors.dangerText, colors.dangerSoft], [colors.surface, colors.primary]]) {
    expect(contrast(rgb(text), rgb(background))).toBeGreaterThanOrEqual(4.5);
  }
});
test('texto branco permanece legível em todos os gradientes após proteção de contraste', () => {
  for (const stops of [...Object.values(gradients), ...demoQuizCategories.map(category => category.gradientColors)]) {
    for (let i = 0; i < stops.length - 1; i++) {
      for (let position = 0; position <= 10; position++) {
        const from = rgb(stops[i]); const to = rgb(stops[i + 1]);
        const base = from.map((value, channel) => value + (to[channel] - value) * position / 10);
        const protectedColor = base.map((value, channel) => value * 0.58 + [0, 30, 65][channel] * 0.42);
        expect(contrast(rgb(colors.surface), protectedColor)).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});
