import AsyncStorage from '@react-native-async-storage/async-storage';
import { describe, it, jest } from '@jest/globals';
import * as Notifications from 'expo-notifications';
import { fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

import { STORAGE_KEY, encodeReminders } from '../src/domain/reminders';
import { appRoutes } from './helpers/appRoutes';

describe('fluxo completo da tela de lembretes (CRUD e notificações)', () => {
  it('exibe cabeçalho, contadores zerados, mensagens iniciais e estado vazio sem medicamentos fictícios', async () => {
    await renderRouter(appRoutes, { initialUrl: '/reminders' });
    await screen.findByText('Nenhum lembrete ainda');

    expect(screen.getByRole('header', { name: 'Lembretes de Medicamentos' })).toBeTruthy();
    expect(screen.getByText('Acompanhe seus horários de forma simples')).toBeTruthy();
    expect(screen.getByLabelText('Total de lembretes: 0')).toBeTruthy();
    expect(screen.getByLabelText('Lembretes ativos: 0')).toBeTruthy();
    expect(screen.getByLabelText('Tomados hoje: 0')).toBeTruthy();

    expect(screen.getByRole('button', { name: 'Ativar notificações' })).toBeTruthy();
    expect(screen.getByText(/Não altere doses, não interrompa tratamentos/)).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Como usar esta tela:' })).toBeTruthy();
    expect(screen.queryByText('Losartana')).toBeNull();
  });

  it('valida formulário, usa atalhos de dias/horário, cria, marca tomado, pausa, desfaz, edita e remove', async () => {
    await renderRouter(appRoutes, { initialUrl: '/reminders' });
    await screen.findByText('Nenhum lembrete ainda');

    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar lembrete' }));
    await screen.findByRole('header', { name: 'Novo lembrete' });

    // Validação com nome vazio, horário inválido e zero dias selecionados
    await fireEvent.changeText(screen.getByLabelText('Horário para tomar'), '99:99');
    await fireEvent.press(screen.getByRole('button', { name: 'Fins de semana' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Domingo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sábado' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar lembrete' }));

    expect(screen.getByText('Informe o nome do lembrete')).toBeTruthy();
    expect(screen.getByText('Informe um horário válido')).toBeTruthy();
    expect(screen.getByText('Selecione ao menos um dia da semana')).toBeTruthy();

    // Preencher dados válidos com atalhos de dias e horário
    await fireEvent.changeText(screen.getByLabelText('Nome do medicamento'), 'Losartana');
    await fireEvent.changeText(screen.getByLabelText('Dosagem'), '50mg — 1 comprimido');
    await fireEvent.press(screen.getByRole('button', { name: 'Definir horário 12:00' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aumentar 15 minutos' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Diminuir 15 minutos' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Dias úteis' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Todos os dias' }));
    await fireEvent.changeText(screen.getByLabelText('Observações'), 'Tomar com um copo de água');

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar lembrete' }));
    await screen.findByText('Losartana');

    expect(screen.getByText('50mg — 1 comprimido')).toBeTruthy();
    expect(screen.getByText('12:00')).toBeTruthy();
    expect(screen.getByText('Tomar com um copo de água')).toBeTruthy();
    expect(screen.getByLabelText('Total de lembretes: 1')).toBeTruthy();
    expect(screen.getByLabelText('Lembretes ativos: 1')).toBeTruthy();
    expect(screen.getByLabelText('Tomados hoje: 0')).toBeTruthy();

    // Marcar como tomado hoje -> Pausar -> Desfazer ainda acessível (LE08)
    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Losartana como tomado hoje' }));
    await screen.findByText('Tomado hoje');
    expect(screen.getByLabelText('Tomados hoje: 1')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Pausar lembrete Losartana' }));
    await screen.findByRole('button', { name: 'Ativar lembrete Losartana' });
    expect(screen.getByLabelText('Lembretes ativos: 0')).toBeTruthy();
    expect(screen.getByLabelText('Tomados hoje: 1')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Desfazer tomada de hoje de Losartana' }));
    await screen.findByText('Pausado');
    expect(screen.getByLabelText('Tomados hoje: 0')).toBeTruthy();

    // Reativar pelo sino
    await fireEvent.press(screen.getByRole('button', { name: 'Ativar lembrete Losartana' }));
    await screen.findByRole('button', { name: 'Pausar lembrete Losartana' });
    expect(screen.getByLabelText('Lembretes ativos: 1')).toBeTruthy();

    // Editar lembrete e testar confirmação de descarte antes de salvar
    await fireEvent.press(screen.getByRole('button', { name: 'Editar lembrete Losartana' }));
    await screen.findByRole('header', { name: 'Editar lembrete' });
    await fireEvent.changeText(screen.getByLabelText('Dosagem'), '');
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar formulário' }));
    await screen.findByText('Descartar alterações?');
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar editando' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar lembrete' }));
    await screen.findByText('Sem dosagem informada');

    // Remover com confirmação (Cancelar -> Confirmar remoção)
    await fireEvent.press(screen.getByRole('button', { name: 'Remover lembrete Losartana' }));
    await screen.findByText('Remover lembrete?');
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByText('Losartana')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Remover lembrete Losartana' }));
    await screen.findByText('Remover lembrete?');
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção' }));
    await screen.findByText('Nenhum lembrete ainda');
    expect(screen.getByLabelText('Total de lembretes: 0')).toBeTruthy();
  });

  it('ativa notificações agendando 30 min antes e na hora, lida com permissão negada e falha de agenda', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      encodeReminders([
        { id: 'r1', name: 'Vitamina D', dose: '2000UI', time: '08:00', days: [1, 3, 5], active: true },
      ]),
    );

    const scheduleSpy = jest.mocked(Notifications.scheduleNotificationAsync);
    scheduleSpy.mockClear();

    await renderRouter(appRoutes, { initialUrl: '/reminders' });
    await screen.findByText('Vitamina D');

    // Falha inicial no agendamento exibe aviso recuperável sem apagar lembrete (LE05)
    scheduleSpy.mockRejectedValueOnce(new Error('Alarm manager unavailable'));
    await fireEvent.press(screen.getByRole('button', { name: 'Ativar notificações' }));
    await screen.findByRole('button', { name: 'Tentar agendar avisos novamente' });
    expect(screen.getByText('Vitamina D')).toBeTruthy();

    // Repetir agendamento agenda 3 dias × 2 alertas (30 min antes + horário exato) = 6 triggers
    scheduleSpy.mockClear();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar agendar avisos novamente' }));
    await screen.findByText('Avisos reagendados com sucesso.');
    expect(scheduleSpy).toHaveBeenCalledTimes(6);

    // Pausar todas as notificações retorna ao banner de ativação
    await fireEvent.press(screen.getByRole('button', { name: 'Pausar todas as notificações' }));
    await screen.findByRole('button', { name: 'Ativar notificações' });

    // Permissão negada não impede cadastro local
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
      status: 'denied' as Notifications.PermissionStatus,
      granted: false,
      canAskAgain: false,
      expires: 'never',
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Ativar notificações' }));
    await screen.findByRole('button', { name: 'Ativar notificações' });
    expect(screen.getByText('Ative as notificações para receber alertas no horário do seu remédio.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Adicionar lembrete' })).toBeEnabled();
  });

  it('recupera erro de leitura e trata links de preset/edição inexistente', async () => {
    const getItemSpy = jest.mocked(AsyncStorage.getItem);
    const originalImpl = getItemSpy.getMockImplementation()!;
    let failStorageRead = true;
    getItemSpy.mockImplementation(async (key: string) => {
      if (key === STORAGE_KEY && failStorageRead) {
        failStorageRead = false;
        throw new Error('Storage offline');
      }
      return originalImpl(key);
    });

    try {
      await renderRouter(appRoutes, { initialUrl: '/reminders' });
      await screen.findByText('Não foi possível carregar');
      await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
      await screen.findByText('Nenhum lembrete ainda');

      // Preset Água preenche sem salvar ao descartar (LF01 / LF08)
      await testRouter.push('/reminders/editor?preset=water');
      await screen.findByDisplayValue('Água');
      await fireEvent.changeText(screen.getByLabelText('Dosagem'), '200ml');
      await fireEvent.press(screen.getByRole('button', { name: 'Fechar formulário' }));
      await screen.findByText('Descartar alterações?');
      await fireEvent.press(screen.getByRole('button', { name: 'Descartar' }));
      await screen.findByText('Nenhum lembrete ainda');

      // ID inexistente oferece retorno seguro
      await testRouter.push('/reminders/editor?id=nao-existe');
      await screen.findByText('Lembrete não encontrado');
      await fireEvent.press(screen.getByRole('button', { name: 'Voltar aos lembretes' }));
      await screen.findByText('Nenhum lembrete ainda');
    } finally {
      getItemSpy.mockImplementation(originalImpl);
    }
  });

  it('bloqueia escrita e preserva o documento quando os dados locais estão corrompidos', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{corrompido');
    await renderRouter(appRoutes, { initialUrl: '/reminders' });
    await screen.findByText('Dados locais precisam de atenção');
    expect(screen.getByRole('button', { name: 'Adicionar lembrete' })).toBeDisabled();
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBe('{corrompido');
  });

  it('cria lembrete de água automaticamente pela seção de adição rápida sem toast de criação', async () => {
    await renderRouter(appRoutes, { initialUrl: '/reminders' });
    await screen.findByText('Nenhum lembrete ainda');
    await screen.findByText('Adicionar rápido');

    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar lembrete de água' }));
    const titles = await screen.findAllByText('Água 💧');
    expect(titles.length).toBeGreaterThanOrEqual(2);

    expect(screen.getByRole('button', { name: 'Marcar Água 💧 como tomado hoje' })).toBeTruthy();
    expect(screen.getAllByText('1 a 2 copos de água').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('08:00')).toBeTruthy();
    expect(screen.getByText('08:00 • Todos os dias')).toBeTruthy();
    expect(screen.getAllByText('Beber pelo menos 2 litros de água por dia').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText('Total de lembretes: 1')).toBeTruthy();
    expect(screen.queryByText('Lembrete criado com sucesso.')).toBeNull();
  });
});
