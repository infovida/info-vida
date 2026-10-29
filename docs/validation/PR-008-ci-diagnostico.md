# PR #8 — diagnóstico do CI

Consulta: 27/10/2026, horário de São Paulo (28/10/2026 UTC).
Commit: `62e99f8c405dec3ef50bfb3a1c3bb713eb45227d`.

O [CI](https://github.com/infovida/info-vida/actions/runs/40617952195)
instalou o lockfile com sucesso, mas falhou em `Check Expo compatibility`:
Expo Doctor passou em 19/20 verificações e identificou três patches abaixo dos
esperados pelo SDK:

| Pacote | Lockfile do PR | Esperado pelo Doctor nessa execução |
| --- | --- | --- |
| expo | 58.0.19 | ~58.0.20 |
| expo-dev-client | 58.0.15 | ~58.0.16 |
| expo-router | 58.0.26 | ~58.0.27 |

Lint, TypeScript e Jest foram pulados após essa falha. Os testes locais anteriores
não incluíam Expo Doctor com rede; `npm run validate` não executa Doctor. Portanto,
58 testes locais aprovados não demonstravam compatibilidade com os patches
consultados no CI. Não desativar o check nem excluir os pacotes da validação.

Atualizar os três pacotes de forma coordenada, incluindo lockfile; executar
Doctor, validate e exportações novamente. Os novos tarballs não estão no cache
local consultado, e a rede de shell deste ambiente é restrita; atualização não
executada nesta análise. Nenhum commit ou push foi criado.

O [E2E Android](https://github.com/infovida/info-vida/actions/runs/40617952185)
ainda estava executando `Build Android test binary` na última consulta desta
análise. Não há conclusão desse workflow neste registro.

O npm também reportou 17 vulnerabilidades (13 baixas e 4 altas); esse aviso não
foi a causa do exit code 1. A identificação e correção exigem auditoria dedicada,
sem atualização forçada indiscriminada. O aviso de depreciação de upload-artifact
é igualmente separado da falha de compatibilidade observada.


## Atualização posterior — alteração verificada no Git local

O commit `de9ab62` (`fix: alinha patches do Expo exigidos pelo CI`) atualizou
`package.json` e `package-lock.json` para os patches apontados na tabela.
Esta atualização registra a correção no código, sem afirmar que o CI foi
reexecutado com sucesso. Conferir checks e logs do head atual antes de mesclar.
O diagnóstico acima permanece como evidência da execução do commit anterior.
