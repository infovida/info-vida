import { afterEach, describe, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppState, View, type AppStateStatus } from 'react-native';

import { CategoryChip, GradientButton, IconButton, ProgressBar } from '../src/components/controls';
import { ConfirmDialog, EmptyState, ErrorState, InlineNotice, Toast } from '../src/components/feedback';
import { BrandHeader, Screen } from '../src/components/layout';
import { StreakCalendar } from '../src/components/StreakCalendar';
import { TabButton } from '../src/navigation/TabButton';

afterEach(() => { jest.useRealTimers(); });
describe('componentes compartilhados', () => {
  it('bloqueia gravação repetida durante loading e informa estado acessível', async () => {
    const press = jest.fn();
    const view = await render(<GradientButton label="Salvar" onPress={press} icon="check" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(press).toHaveBeenCalledTimes(1);
    await view.rerender(<GradientButton label="Salvar" onPress={press} loading />);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(press).toHaveBeenCalledTimes(1);
    await view.rerender(<GradientButton label="Salvar" onPress={press} disabled variant="danger" />);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });
  it('expõe seleção, foco e rótulos de ações sem depender de cor ou ícone', async () => {
    const press = jest.fn();
    await render(<View>
      <CategoryChip label="Vacinação" selected onPress={press} />
      <CategoryChip label="Todos" selected={false} onPress={press} />
      <IconButton label="Fechar" icon="close" onPress={press} />
      <IconButton label="Indisponível" icon="plus" onPress={press} disabled />
    </View>);
    const chip = screen.getByRole('button', { name: 'Vacinação' });
    expect(chip).toBeSelected();
    await fireEvent(chip, 'focus');
    await fireEvent(chip, 'blur');
    await fireEvent.press(chip);
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Indisponível' }));
    expect(press).toHaveBeenCalledTimes(2);
  });
  it('limita progresso inválido e comunica percentual ao leitor de tela', async () => {
    const view = await render(<ProgressBar value={120} label="Perguntas respondidas" />);
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ min: 0, max: 100, now: 100 });
    await view.rerender(<ProgressBar value={-10} label="Perguntas respondidas" />);
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 0 });
    await view.rerender(<ProgressBar value={NaN} label="Perguntas respondidas" />);
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 0 });
  });
  it('diálogo respeita cancelar, erro e operação em andamento sem confirmar duas vezes', async () => {
    const cancel = jest.fn(); const confirm = jest.fn();
    const view = await render(<ConfirmDialog visible title="Remover lembrete?" message="Confirme a remoção."
      onCancel={cancel} onConfirm={confirm} destructive error="Não foi possível salvar" />);
    expect(screen.getByRole('alert')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(cancel).toHaveBeenCalledTimes(1);
    await fireEvent(screen.getByTestId('confirmation-dialog'), 'requestClose');
    expect(cancel).toHaveBeenCalledTimes(2);
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    expect(confirm).toHaveBeenCalledTimes(1);
    await view.rerender(<ConfirmDialog visible title="Remover lembrete?" message="Confirme a remoção."
      onCancel={cancel} onConfirm={confirm} busy />);
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(2);
    await fireEvent(screen.getByTestId('confirmation-dialog'), 'requestClose');
    expect(cancel).toHaveBeenCalledTimes(2);
  });
  it('mantém dados de erro explícitos e dá ação para tentar novamente', async () => {
    const retry = jest.fn();
    await render(<Screen scroll={false} header={<BrandHeader title="Título" icon="quiz" />}>
      <EmptyState title="Sem atividade" message="Comece quando quiser." />
      <ErrorState onRetry={retry} />
      <InlineNotice tone="success" message="Registro salvo" />
      <InlineNotice tone="warning" message="Permissão pendente" />
    </Screen>);
    expect(screen.getByText('Sem atividade')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
  it('aviso pode ser fechado manualmente e limpa seu timer ao sair', async () => {
    jest.useFakeTimers();
    const dismiss = jest.fn();
    const view = await render(<Toast message="Registro salvo" onDismiss={dismiss} duration={3000} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar aviso' }));
    expect(dismiss).toHaveBeenCalledTimes(1);
    await view.unmount();
    await act(() => jest.advanceTimersByTime(3000));
    expect(dismiss).toHaveBeenCalledTimes(1);
    await render(<Toast message="Outro aviso" onDismiss={dismiss} duration={3000} />);
    await act(() => jest.advanceTimersByTime(3000));
    expect(dismiss).toHaveBeenCalledTimes(2);
  });
  it('calendário não inventa atividade nas lacunas e suporta formato compacto', async () => {
    const view = await render(<StreakCalendar dates={['2026-10-25', '2026-10-27']} today="2026-10-27" />);
    expect(screen.getByText('1 dia seguido')).toBeTruthy();
    expect(screen.getByLabelText('Segunda-feira, 2026-10-26: sem atividade')).toBeTruthy();
    expect(screen.getByLabelText('Terça-feira, 2026-10-27: atividade concluída, hoje')).toBeTruthy();
    await view.rerender(<StreakCalendar dates={[]} today="2026-10-27" compact />);
    expect(screen.getByText('0 dias seguidos')).toBeTruthy();
    expect(screen.queryByText('Recorde: 0 dias')).toBeNull();
  });
  it('atualiza o calendário ao virar o dia e voltar ao app', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 27, 23, 59, 59));
    let onState: (state: AppStateStatus) => void = () => {};
    const listener = jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => {
      onState = callback; return { remove: jest.fn() };
    });
    const view = await render(<StreakCalendar dates={['2026-10-27']} />);
    expect(screen.getByLabelText('Terça-feira, 2026-10-27: atividade concluída, hoje')).toBeTruthy();
    await act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByLabelText('Quarta-feira, 2026-10-28: sem atividade, hoje')).toBeTruthy();
    jest.setSystemTime(new Date(2026, 9, 29, 12));
    await act(() => onState('active'));
    expect(screen.getByText('0 dias seguidos')).toBeTruthy();
    await view.unmount(); listener.mockRestore();
  });
  it('a aba Emergência informa seleção e encaminha toque/foco corretamente', async () => {
    const press = jest.fn(); const focus = jest.fn();
    await render(<TabButton label="Emergência" icon="emergency" isFocused onPress={press} onFocus={focus} />);
    const tab = screen.getByRole('tab', { name: 'Emergência' });
    expect(tab).toBeSelected();
    await fireEvent(tab, 'focus'); await fireEvent(tab, 'blur'); await fireEvent.press(tab);
    expect(press).toHaveBeenCalledTimes(1); expect(focus).toHaveBeenCalledTimes(1);
  });
});
