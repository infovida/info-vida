import { afterEach, describe, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';

import { WelcomeScreen } from '../src/features/onboarding/WelcomeScreen';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(() => ({ width: 390, height: 844, scale: 1, fontScale: 1 })),
}));

afterEach(() => {
  jest.mocked(useWindowDimensions).mockReturnValue({ width: 390, height: 844, scale: 1, fontScale: 1 });
});

describe('entrada do InfoVida', () => {
  it('mostra marca, slogan e instituições sem pedir conta e inicia apenas uma vez', async () => {
    const start = jest.fn();
    await render(<WelcomeScreen onStart={start} />);
    expect(start).not.toHaveBeenCalled();
    expect(screen.getByRole('header', { name: 'InfoVida' })).toBeTruthy();
    expect(screen.getByText('Sua saúde, nossa prioridade')).toBeTruthy();
    expect(screen.getByRole('image', { name: 'PET-TECHSUS — Transformação Digital no SUS' })).toBeTruthy();
    expect(screen.getByRole('image', { name: 'UNIFAL-MG' })).toBeTruthy();
    expect(screen.getByRole('image', { name: 'Ministério da Saúde' })).toBeTruthy();
    expect(screen.queryByText('Criar Conta')).toBeNull();
    const button = screen.getByRole('button', { name: 'Começar' });
    await fireEvent.press(button);
    await fireEvent.press(button);
    expect(start).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
  });
  it('falha de imagem preserva identificação e não bloqueia o acesso offline', async () => {
    const start = jest.fn();
    await render(<WelcomeScreen onStart={start} />);
    for (const label of ['PET-TECHSUS — Transformação Digital no SUS', 'UNIFAL-MG', 'Ministério da Saúde']) {
      await fireEvent(screen.getByRole('image', { name: label }), 'error', { nativeEvent: { error: 'Image unavailable' } });
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getByRole('header', { name: 'InfoVida' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Começar' }));
    expect(start).toHaveBeenCalledTimes(1);
  });
  it('permite repetir acesso se a navegação falhar, sem ocultar o erro', async () => {
    const start = jest.fn<() => void>().mockImplementationOnce(() => { throw new Error('Route unavailable'); });
    await render(<WelcomeScreen onStart={start} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Começar' }));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Começar' })).toBeEnabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Começar' }));
    expect(start).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('mantém ações e identificação com fontes ampliadas e tela estreita', async () => {
    jest.mocked(useWindowDimensions).mockReturnValue({ width: 360, height: 800, scale: 1, fontScale: 2 });
    const start = jest.fn();
    await render(<WelcomeScreen onStart={start} />);
    expect(screen.getByText('Acesse os conteúdos sem criar conta')).toBeTruthy();
    expect(screen.getByText('Desenvolvido por')).toBeTruthy();
    expect(screen.getByText('Apoio')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Começar' }));
    expect(start).toHaveBeenCalledTimes(1);
  });
});
