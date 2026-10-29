# InfoVida

Aplicativo informativo em **React Native, Expo SDK 58, TypeScript e Expo Router**.
A base da equipe foi preservada e a identidade visual do Figma Make está sendo
adaptada para o aplicativo nativo, com implementação por PRDs.

**Vai continuar a implementação?** Comece pelo
[guia de continuidade](docs/CONTINUIDADE.md), pelo
[índice de PRDs](docs/prd/README.md) e por [CONTRIBUTING.md](CONTRIBUTING.md).
As orientações para agentes estão em [AGENTS.md](AGENTS.md).

## O que já pode ser testado

| Área | Estado atual |
| --- | --- |
| Entrada e navegação | Acesso como visitante, identidade visual compartilhada e cinco abas |
| Notícias | Seis exemplos fictícios, filtros e leitura dos artigos; sem API |
| Quiz | Seis categorias, três perguntas demo por categoria, aleatório com até cinco, explicações e resultado |
| Lembretes | Aba provisória; regras de domínio já portadas e testadas |
| Emergência e Perfil | Apresentações provisórias, sem os fluxos completos |
| Recompensas e notificações | Especificadas em PRDs, ainda sem telas funcionais |

O quiz usa exemplos sobre uso do app e leitura de informações; suas sessões ficam
somente em memória e são perdidas ao reiniciar. Não há XP, conquistas, sequência
ou tentativas persistidas. Notícias fictícias também não geram progresso.
Persistência, notificações nativas, autenticação e backend ainda não estão integrados.

## Instalar e testar a branch baixada

Execute na pasta que contém `package.json`. Use Node compatível com os `engines`
do [package.json](package.json); [.nvmrc](.nvmrc) registra a referência da equipe
(22.13.0). Com nvm disponível, `nvm install` e `nvm use` selecionam essa versão.

```bash
npm ci
```

Não é necessário configurar API, copiar `.env` ou criar conta Expo para testar a
demonstração. [.env.example](.env.example) é apenas uma referência para integração
futura; seu endereço não é um serviço ativo do aplicativo.

### No navegador

```bash
npm run web
```

Abra o endereço mostrado no terminal se o navegador não abrir automaticamente.

### No celular com Expo Go

Instale o **Expo Go**, conecte celular e computador à mesma rede Wi-Fi e execute:

```bash
npx expo start --go
```

No Android, escaneie o QR code pelo Expo Go; no iPhone, use a câmera para abrir o
link no Expo Go. Toque em **Começar**, navegue pelo Início, abra um artigo e teste
as categorias do Quiz. As abas provisórias informam que estão em preparação.

Se a sessão/cache anterior estiver interferindo:

```bash
npx expo start --go --clear
```

O Fast Refresh pode preservar a rota atual; feche a sessão do Expo Go e reabra pelo
QR code para conferir novamente a entrada. Testar na web não substitui conferir
safe area, teclado, navegação e acessibilidade no Android.

## Onde fica cada parte

| Caminho | Responsabilidade |
| --- | --- |
| `app/` | Rotas Expo Router e layouts; manter composição enxuta |
| `src/features/` | Telas e fluxos de entrada, notícias, quiz e áreas provisórias |
| `src/components/`, `src/theme/`, `src/navigation/` | Componentes, tokens e navegação compartilhados |
| `src/domain/` | Regras puras de lembretes, quiz, sessão e atividade |
| `src/services/contracts.ts` | Contratos de repositórios; não equivalem a adapters implementados |
| `src/hooks/` | Recursos compartilhados de estado/carregamento |
| `assets/`, `scripts/` | Imagens/ícones locais, licenças e geração opcional de assets |
| `tests/`, `.maestro/` | Testes de domínio/componentes e jornadas Android |
| `docs/` | Continuidade, PRDs, referências e registros de validação |

## PRDs e sequência de trabalho

O [índice de PRDs](docs/prd/README.md) separa os documentos em:

- **Implementados:** análise inicial e entregas 003–006, no escopo descrito.
- **Parcialmente implementados:** estabilização (002) e quiz demo (007–009).
- **Não implementados:** fluxos 010–015, mesmo quando já há domínio ou aba provisória.

Cada PRD registra o que existe, critérios de aceite e pendências. “Implementado”
não significa produto completo ou aprovação visual final. Persistência de
progresso, catálogo de saúde revisado e API continuam como trabalhos futuros.

A próxima área planejada é Lembretes, com
[PRD-010](docs/prd/nao-implementados/PRD-010-lembretes.md) e
[PRD-011](docs/prd/nao-implementados/PRD-011-lembrete-formulario.md) lidos juntos.
O pedido atual da equipe define a prioridade; o guia de continuidade orienta
como retomar também quiz, notícias e os demais fluxos.

## Validação e checks

```bash
npm run doctor
npm run validate
```

**São comandos diferentes:** Doctor verifica compatibilidade Expo e pode precisar
de rede; `validate` executa lint, TypeScript e testes com cobertura mínima global
de 70%. O CI exige ambos. Use `npm ci` para instalar o lockfile; ao mudar pacotes,
atualize `package.json` e `package-lock.json` juntos. Consulte
`npx expo install --check` antes de ajustar dependências do Expo e revise o diff.

| Comando | Finalidade |
| --- | --- |
| `npm test` | Jest, domínio e componentes |
| `npm run test:watch` | Testes durante desenvolvimento |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run lint` | ESLint sem avisos |
| `npm run typecheck` | TypeScript sem emissão |
| `npm run test:e2e:android` | Maestro; exige app instalado e aparelho/emulador configurado |

Os testes ficam em `tests/`, nunca em `app/`. Use Jest para regras puras, React
Native Testing Library para comportamento de telas e Maestro para jornadas
nativas. [.maestro/smoke.yaml](.maestro/smoke.yaml) depende de um app instalado com
o identificador configurado; não é um teste executado dentro do Expo Go.

Registros das entregas:

- [Fundação visual](docs/validation/PRD-003-validacao.md) e [entrada](docs/validation/PRD-004-validacao.md).
- [Notícias e artigos fictícios](docs/validation/PRD-005-006-validacao.md).
- [Quiz de demonstração](docs/validation/PRD-007-009-demo-validacao.md).
- [Diagnóstico do CI do PR #8](docs/validation/PR-008-ci-diagnostico.md).

A entrega demo documentou 58 testes e exportações Android/web aprovados. Depois,
o CI apontou patches Expo abaixo dos esperados; o commit `de9ab62` atualizou os
três pacotes e o lockfile. Isso não confirma o resultado de um novo CI: conferir
os checks do commit atual. Registros antigos são evidências datadas, não status
remoto em tempo real. Exportação Metro não equivale a APK ou E2E, e a revisão
visual/TalkBack/fonte ampliada em aparelho permanece pendente de comprovação.

## GitHub Actions e builds

- [CI](.github/workflows/ci.yml): em PRs para `main` e pushes em `main`, instala o
  lockfile e executa Doctor, lint, TypeScript e testes com cobertura.
- [E2E Android](.github/workflows/e2e-android.yml): compila o app, inicia emulador e
  executa Maestro; gera diagnósticos quando disponíveis.
- [Build EAS](.github/workflows/build.yml): workflow manual de build; depende de
  configuração Expo/EAS e do secret `EXPO_TOKEN`. Não publica nas lojas.
- [Dependabot](.github/dependabot.yml): atualizações semanais, React/react-dom
  agrupados e majors de ESLint/TypeScript adiados para migrações próprias.

[eas.json](eas.json) mantém os perfis `development`, `preview` e `production`.
A demonstração local não requer EAS. Para distribuição, ainda é preciso vincular
o projeto à conta Expo, configurar credenciais e substituir `com.example.infovida`
por identificadores definitivos; ao mudar o ID, alinhar também o fluxo Maestro.
Builds de distribuição, commits, push, PRs e publicações dependem de autorização.

## Referência Figma Make e organização Git

A raiz Git é esta pasta `InfoVida`, mesmo quando estiver dentro de outra pasta no
computador. Não é necessário mover o clone nem enviar sua pasta pai. No GitHub,
`app/`, `src/` e `docs/` aparecem diretamente na raiz do repositório.

A exportação completa `../InfoVida_FigmaMake/` fica como referência local fora
deste Git. O app instala, roda e testa sem ela. Assets utilizados, licenças e
rascunhos extraídos em [docs/reference/figma-make/](docs/reference/figma-make/README.md)
acompanham o projeto. Rascunhos de notícias/perguntas não são conteúdo editorial
aprovado. Não copiar dependências HTML/CSS, Radix ou shadcn para o runtime nativo.
