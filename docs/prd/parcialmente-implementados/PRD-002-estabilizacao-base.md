# PRD-002 — Estabilização da base e extração do Figma Make

**Estado atual:** Parcialmente implementado — estabilização local entregue; validação completa pendente.

Configuração, dependências diretas, domínio e ajustes de CI preparados. Lint, TypeScript, 58 testes e exportações Metro passaram na entrega mais recente. Ainda faltam instalação limpa/Doctor e auditoria com rede, CI remoto e smoke Android; não considerar a falha original do E2E resolvida.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Data: 27/10/2026. Registro original: alterações locais implementadas; na ocasião, validação Expo/Android pendente por indisponibilidade de dependências. Sem commit, push, PR ou alterações remotas.

## Objetivo e autorização

Após o PRD-001, Ana autorizou estabilizar a base da equipe e acrescentar material aproveitável do Figma Make. A proibição de publicar commits/PRs permanece. Esta fase prepara a implementação funcional; não implementa todas as telas do MVP.

## Organização

- `InfoVida/`: pasta definitiva de desenvolvimento, originada de InfoVida_github, com o mesmo `.git`, remote e histórico.
- `InfoVida_FigmaMake/`: nome corrigido da exportação web, preservada para referência até concluir as telas nativas. Não é a base de desenvolvimento do produto consolidado.
- A documentação passou a ficar em `InfoVida/docs/prd/`, sem cópia duplicada no diretório pai.

Não foi excluído o protótipo antes de concluir a migração. Não houve mudança nos destinos remotos Git. As telas do time foram mantidas. Não foram acrescentados pacotes de UI web ao Expo.

## Alterações implementadas

1. Remoção de `expo.newArchEnabled` do app.json, campo rejeitado no CI inspecionado.
2. Declaração direta de `expo-constants ~58.0.13` e `expo-linking ~58.0.14`, nas versões já resolvidas no lockfile da equipe. Lockfile atualizado e normalizado por `npm install --package-lock-only --offline --ignore-scripts --no-audit --no-fund` com sucesso. SDK Expo 58 mantido.
3. Faixa de Node alinhada à interseção dos engines dos pacotes Expo/RN instaláveis no lockfile. `.nvmrc` do time continua em 22.13.0; execução deste ambiente usa Node 24.21.0.
4. Cobertura Jest passa a incluir `src/`; limiar global de 70% preservado.
5. Domínio de lembretes portado sem DOM/localStorage/Notification. Geração de ID removida dessa camada: cabe à futura integração com plataforma. Mantidas validação, serialização e regras de recorrência, tomada e supressão de duplicação.
6. Modelo de questão e regras de quiz independentes de UI. Seleção Fisher–Yates substitui a ideia de embaralhar com sort aleatório; aceita fonte aleatória injetada e valida índices/quantidade. Não existe ainda persistência de tentativas.
7. Nove casos de lembretes adaptados para Jest e três testes de quiz adicionados. Os casos cobrem regras observáveis, sem acoplamento à futura interface.
8. Oito artigos e dezoito perguntas em seis categorias extraídos em JSONs de rascunho para `docs/reference/figma-make/`. Não são servidos como conteúdo validado. Imagens originais preservadas em `assets/figma-make/`; atribuições recebidas copiadas com aviso de revisão editorial e de direitos pendentes.
9. Dependabot agrupa patches/minors de React/react-dom. Majors de TypeScript/ESLint deixam de ser propostas automaticamente, até migração planejada. Isso não fecha PRs já existentes nem habilita automerge.
10. Workflow E2E passa a habilitar permissões KVM conforme documentação do android-emulator-runner e exigir aceleração. Maestro grava JUnit e diagnóstico em pasta explícita, incluindo logcat em caso de falha. Artefatos locais ignorados pelo Git. A alteração melhora execução/diagnóstico; não constitui prova de correção da falha remota original.
11. README orienta bootstrap com npm ci a partir do lockfile existente; ajustes de versões Expo ficam como operação intencional, não como alteração automática em cada clone.

## Validação e limitações

| Verificação | Resultado |
| --- | --- |
| Normalização do lockfile offline | Passou |
| Coerência package.json/lockfile/configuração | Passou |
| Estrutura dos JSONs e índices de respostas | Passou: 8 artigos, 6 categorias, 18 perguntas |
| Regras de lembretes e quiz | 12/12 passaram em America/Sao_Paulo e UTC usando runner do Node sobre o mesmo código |
| Jest/Expo, lint, typecheck e cobertura global | Não executados com sucesso: instalação completa indisponível |
| npm ci com rede | Bloqueado: EAI_AGAIN e DNS indisponível; ambiente declara rede de shell desativada |
| npm ci offline | Cache incompleto: ENOTCACHED para zod-validation-error 4.0.2 |
| Expo Doctor atual e auditoria de dependências | Pendentes de instalação/rede |
| Build, inicialização, smoke e inspeção visual Android/iOS | Pendentes; Maestro não está instalado neste ambiente |
| git diff --check | Passou |

Para testar as regras sem dependências, foram criadas cópias temporárias dos arquivos de teste em `/tmp`, trocando apenas o import do runner Jest para node:test e resolvendo o caminho do módulo TypeScript. Não substitui executar o preset Jest/Expo nem comprova cobertura global de 70%. O aviso de módulo ESM emitido por Node é específico desse executor temporário; o package.json não foi convertido para ESM, pois as configurações Expo/Jest do time usam CommonJS.

Não foi instalado pacote com --force/--legacy-peer-deps, não se aplicou audit fix, não se ignoraram falhas de qualidade e não foram disparados workflows remotos. A pasta node_modules pode estar incompleta após a tentativa de instalação; npm ci deve reconstruí-la quando houver acesso ao registry.

## Próxima execução com rede e Android

Na pasta `InfoVida`, com Node da faixa suportada:

```bash
npm ci
npm run doctor
npm run validate
npm audit
```

Se Doctor solicitar alinhamento adicional, revisar o resultado de `npx expo install --check` e ajustar pacote/lockfile em conjunto; não atualizar majors indiscriminadamente. Depois, executar o workflow E2E revisado ou build local equivalente com SDK Android/Java/Gradle e Maestro disponíveis. Examinar JUnit/logcat e artefatos antes de declarar o smoke corrigido.

Critério de conclusão da estabilização: instalação limpa, Doctor, lint, TypeScript, Jest com cobertura mínima e smoke Android passam na combinação final. Esse critério ainda não foi integralmente demonstrado neste ambiente.

Depois disso: implementar navegação/telas Expo, persistência e notificações, usando o domínio portado. Aprovação dos sete PRs permanece pendente; não houve review, merge ou fechamento nesta etapa. Arquivar a exportação web apenas após conferir migração funcional e visual com a equipe.

## Referências técnicas consultadas

- Dependências do Router: https://docs.expo.dev/router/installation/
- Preset Jest/Expo: https://docs.expo.dev/develop/unit-testing/
- KVM em runners Linux: https://github.com/ReactiveCircus/android-emulator-runner#running-hardware-accelerated-emulators-on-linux-runners
- Relatórios Maestro: https://docs.maestro.dev/maestro-flows/workspace-management/test-reports-and-artifacts

## Direção de produto confirmada por Ana — notícias

O objetivo principal do aplicativo é informativo. A aba inicial de notícias deverá,
futuramente, obter conteúdo por API (provedor e contrato ainda não definidos).
Até essa integração, usar exemplos explicitamente fictícios para demonstrar a
interface, com indicação visível de demonstração. Não apresentar os artigos
extraídos do protótipo como notícias atuais ou fontes verificadas. A visualização
dessa aba não depende de backend, chave de API ou autenticação nesta fase.

A tela Expo atual ainda é a tela de preparação da equipe (`app/index.tsx`). A
interface visual do Figma Make precisa ser portada antes de aparecer no app
nativo; executar o projeto não realiza essa migração automaticamente.

## Especificação das próximas telas

A documentação por tela está em [índice de PRDs](../README.md), com tokens,
rotas, estados, testes e critérios de aceite. A identidade visual vem da exportação
Figma Make. Regras novas de gamificação, entrada como visitante e central interna
estão identificadas como propostas; notícias fictícias e futura API são direção
confirmada por Ana. A criação destes PRDs não altera o estado de validação da base
nem implementa novas telas no runtime.

## Atualização posterior — implementação do PRD-003

As dependências locais passaram a estar disponíveis. Lint, tipos, Jest/cobertura e
exportações Metro Android/web foram executados durante a fundação visual. O
[registro atual](../../validation/PRD-003-validacao.md) complementa os limites do
levantamento original acima; não comprova teste visual ou E2E Android em aparelho.
