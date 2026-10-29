# Validação — PRDs 005 e 006: feed fictício e leitura

Data: 27/10/2026. Alterações locais, sem commit/PR/publicação.

## Entrega

Feed com identidade do Figma Make: cabeçalho branco, logo, avatar de visitante,
aviso explícito de demonstração, destaque azul/ciano, filtros com ícones e cards
brancos arredondados. São seis textos novos de demonstração e duas ilustrações
locais em 16:9, não notícias reais nem reprodução das alegações não verificadas
da exportação. API de notícias ainda não foi escolhida ou conectada.

Leitura em rota por ID, usando o mesmo repositório, sem barra inferior. Voltar
usa histórico e preserva categoria/instância da lista. A posição é armazenada por
eventos de rolagem e restaurada no foco; isso exige confirmação física no Android.
Nenhum exemplo gera evento de leitura, conta, XP ou conquista.

## Verificações executadas

`npm run validate` passou: lint sem warnings, TypeScript sem erros e **46 testes
em 10 suítes**. Cobertura global: 94,49% statements, 90,93% branches, 92,91%
functions e 97,13% lines. Mínimo global de 70% preservado.

Casos relevantes:

- Catálogo com IDs únicos e fonte fictícia; filtros, vazio, identidade entre
  lista/detalhe e cópia que não altera fixtures. Dados duplicados/incompletos,
  datas reais, URLs remotas e fonte não fictícia são rejeitados no adapter demo.
- Feed → filtro → artigo → Voltar/Back, com categoria mantida e sem tab bar na leitura.
- Categoria sem exemplo → Ver todos, mantendo aviso fictício em ambos os estados.
- Falhas e retry da listagem e da leitura, sem exibir dados de sucesso inventados.
- Resposta antiga não substitui o resultado do filtro mais recente.
- Acesso direto sem histórico, ID inexistente e identificação ausente, sem crash.
- Fallback da capa/identificador de imagem e da marca; card com uma ação acessível.
- Entrada e navegação das cinco abas continuam verificadas pelo Router real.

As ilustrações PNG 800×450 foram abertas e inspecionadas como arquivos, sem que
isso equivalha a screenshot da tela. Scripts de rasterização são opcionais e
independentes da pasta Figma Make; SVGs fonte e licenças dos ícones estão locais.
Nenhuma dependência de runtime foi adicionada. Cache Python está ignorado pelo Git.

## Pendências de verificação em aparelho

A aparência final, contraste sobre imagens, foco/ordem TalkBack, fonte 200%,
comportamento visual da lista em 360/390/412 dp e posição real após Voltar ainda
precisam de revisão no Android. Testes de navegação/componentes não medem pixels
nem comprovam o scroll do aparelho. Não houve screenshot aprovado no ambiente.
Maestro atualizado para entrada → feed → artigo → Back → abas, mas não executado
em build/emulador Android nesta etapa.

Expo Doctor completo, auditoria atualizada de dependências, APK/EAS e CI remoto
não fazem parte da evidência desta entrega. O empacotamento Metro de Android e web passou; ele não equivale a build APK
nem a teste visual em aparelho.

## Teste manual

Na pasta InfoVida, `npx expo start --go --clear`; reabrir pelo QR code se a sessão
anterior estiver preservada. Começar → Início. Conferir aviso fictício, arrastar
filtros, escolher Nutrição e abrir seu card. Ler e voltar: Nutrição deve permanecer
selecionada. Conferir Infância vazia e Ver todos. Abrir Perfil confirma visitante
sem progresso fictício. O destaque Quiz abre a aba ainda em preparação.


## Empacotamento concluído

`CI=1 EXPO_OFFLINE=1 npx expo export --platform android --platform web --output-dir /tmp/infovida-prd005-006-bundles --max-workers 2` passou.
Bundle Hermes Android, bundle web e assets foram gerados em /tmp, fora do Git.
Imagens 16:9, sintaxe do fluxo Maestro, links locais e git diff --check passaram.
