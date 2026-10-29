/** Modelos e regras extraídos do fluxo do Figma Make, sem dependência de UI. */
export interface Question {
  question: string;
  options: readonly string[];
  correctAnswer: number;
  explanation: string;
  emoji: string;
}

/** Fisher–Yates: não altera o catálogo e permite controlar o sorteio em testes. */
export function selectQuestions<T>(questions: readonly T[], count: number, random = Math.random): T[] {
  if (!Number.isInteger(count) || count < 0) throw new Error('Quantidade inválida');
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Sorteio inválido');
    const j = Math.floor(value * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function isCorrectAnswer(question: Question, answer: number): boolean {
  return Number.isInteger(answer) && answer >= 0 && answer < question.options.length
    && answer === question.correctAnswer;
}


export interface QuizQuestion extends Question { id: string; contentVersion: string; isDemo: boolean }
export interface QuizCategory {
  id: string; label: string; emoji: string; gradientColors: readonly string[]; questionIds: readonly string[];
}
