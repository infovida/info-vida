# Orientações para agentes — InfoVida

Antes de implementar, leia nesta ordem:

1. [README.md](README.md): estado atual, execução e limites da demonstração.
2. [docs/CONTINUIDADE.md](docs/CONTINUIDADE.md): passagem de contexto, mapa do código,
   decisões confirmadas, sequência de leitura por tarefa e cuidados de implementação.
3. [docs/prd/README.md](docs/prd/README.md): classificação e pendências dos PRDs.
4. [CONTRIBUTING.md](CONTRIBUTING.md), PRD-003, PRD da funcionalidade solicitada e
   seus registros em `docs/validation/`, conforme o guia de continuidade.

Preserve a base Expo/React Native da equipe e a identidade visual do Figma Make.
`app/` contém rotas; implemente a apresentação em `src/features/` e reutilize
`src/components/`, `src/theme/`, `src/navigation/` e `src/domain/`.

Notícias e quiz atuais são demonstrações: não apresentar conteúdo clínico não
revisado como validado nem converter atividades demo em progresso/XP real.
Interfaces de repositório não são implementações de persistência.

A exportação `../InfoVida_FigmaMake/` é referência local opcional, fora do Git;
não movê-la para o repositório nem adicionar dependência de runtime dela.

Confira o estado Git e preserve alterações existentes. Implementar localmente não
é autorização para commit, push, criação/alteração de PR, merge ou publicação:
execute essas ações somente quando autorizadas no contexto da tarefa.

Ao entregar, atualize PRD/estado/validação e documente o que passou e o que não foi
executado. `npm run validate` não inclui Expo Doctor; exportação Metro não prova
build APK ou E2E Android. Não desative checks para obter um resultado verde.
