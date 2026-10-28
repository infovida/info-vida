# Validação — PRD-003

Data: 27/10/2026. Alterações locais, sem commit ou PR.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| ESLint com zero warnings | Passou |
| TypeScript (`tsc --noEmit`) | Passou |
| Jest/Expo | 6 suítes, 28 testes passaram |
| Cobertura global | Acima do mínimo de 70% em statements, branches, functions e lines |
| Contraste de texto | Combinações do tema e amostras dos gradientes com scrim passaram em AA 4,5:1 |
| Expo install --check offline | Informou dependências atualizadas; a própria CLI ressalva a limitação da checagem offline |
| Metro: exportação Android | Passou; bundle Hermes e assets gerados |
| Metro: exportação web | Passou |
| PNGs de ícones | 22 imagens transparentes RGBA de 96×96 validadas |
| git diff --check | Passou |

Comando da exportação: `CI=1 EXPO_OFFLINE=1 npx expo export --platform android --platform web --output-dir /tmp/infovida-prd003-bundles --max-workers 2`.
Bundles em /tmp, fora do repositório. Exportação de JavaScript/Hermes não é build
APK nem prova de execução no aparelho. Não foram solicitados builds EAS ou ações
no GitHub. Não houve atualização de bibliotecas nesta entrega.

## Cobertura comportamental

- Router real: entrada → Home, cinco abas, seleção, retorno pelo histórico,
  CTA para Quiz, avatar para Perfil e recuperação de rota inválida.
- Botão ocupado/desabilitado não executa ação repetida; chips/abas comunicam seleção.
- Confirmação suporta cancelar/Voltar, bloqueia fechamento durante gravação e
  mantém erro visível. testID da Modal serve ao evento nativo requestClose,
  que não pode ser disparado corretamente pelo texto descendente.
- Aviso fecha manualmente ou por tempo e limpa timer ao desmontar.
- Progresso limita valores inválidos e comunica faixa/valor ao leitor de tela.
- Calendário ignora datas inválidas/futuras/duplicadas, preserva lacunas e recorde,
  atravessa mês/ano/horário de verão e atualiza na meia-noite/foreground.
- Regras já portadas de quiz e lembretes continuam cobertas pelo Jest real.

## Pendências explícitas

Chrome/Playwright não iniciou no sandbox: chamadas de socket/shutdown foram
recusadas pelo ambiente. Não há screenshots de aceite nem comparação visual
final com o Figma. Não se contornaram as permissões do ambiente.

É necessário conferir no Android real: aparência de gradientes/sombras/ícones,
safe area e gestos, TalkBack, fonte 200%, telas de 360/390/412 dp e navegação com
Back. Smoke Maestro foi atualizado, mas não executado porque o ambiente não
disponibiliza o conjunto emulador/build/Maestro pronto para esse fluxo.
Expo Doctor completo, audit atualizado e CI remoto continuam fora da validação
desta entrega; a checagem offline não equivale a esses resultados.

## Conferência pelo Expo Go

Na raiz InfoVida:

```bash
npx expo start --go --clear
```

Abrir pelo QR code na mesma rede Wi-Fi. Esperado: identidade azul/ciano, marca
InfoVida, cards arredondados e abas Início, Quiz, Lembretes, Emergência e Perfil.
As áreas provisórias informam preparação; não há notícia fictícia, consulta API,
CRUD de lembrete, quiz funcional ou XP sendo concedido nesta fundação.
A entrada visual é o próximo PRD (004); o feed fictício vem no PRD-005.
