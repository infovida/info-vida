# PRD-013 — Perfil, atividade e informações do projeto

**Estado atual:** Não implementado como funcionalidade.

Existe apresentação de visitante, sem histórico real conectado. Estatísticas, edição e informações previstas no PRD continuam pendentes.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P3.
Origem: `Profile.tsx`; destino `app/(tabs)/profile.tsx`, feature `profile`.
Dependências: [PRD-003](../implementados/PRD-003-sistema-visual.md), [PRD-014](PRD-014-recompensas.md).

## Objetivo e layout

Reunir identificação local, progresso educativo e informações do projeto,
sem apresentar uma conta inexistente como autenticada. Header gradiente da marca,
padding horizontal 16 e região inferior maior para composição com avatar.
Avatar central 96/raio 28 em branco com emoji/ícone; título 24/700 e subtítulo 14.
No primeiro uso: `Visitante` e `Progresso salvo neste aparelho`, sem Maria Silva
ou email fictício. Ícone de lápis/engrenagem não será ativo sem função definida.

Corpo margem 16, cards brancos raio 24, padding 16, gap 16:
1. `Sua atividade` com pill XP e grid 2×2 de gradientes: quizzes completos,
dias seguidos, artigos lidos e conquistas. Valores 24/700, labels 12.
2. `Conquistas` com contagem, barra global e lista expansível. Cinco visíveis
inicialmente; `Ver todas (N mais)`/`Ver menos` apenas se houver mais de cinco.
3. `Temas favoritos`, preservando ícones/barras como referência, mas dados
representam leituras reais por tema, não porcentagens 85/70/60/45 inventadas.
4. `Sobre o InfoVida`, header azul, marca, descrição educativa, instituição e
equipe de desenvolvimento em cards leves. Créditos/ano vêm de conteúdo revisado,
sem congelar 2025 do protótipo. Cinco abas, Perfil ativo.

Primeira atividade/contagem inicia em zero; falha de carregamento é erro, não zero.
Seção de favoritos sem dados mostra `Seus temas aparecerão após leituras de
conteúdos reais`. Na fase de feed fictício, leituras demo não contam.

## Interações e regras

Avatar é apresentação no MVP. Edição de nome/avatar e configurações são evolução
não confirmada; omitir ícones clicáveis sem handler, mantendo áreas visuais sem
prometer recursos. Não mostrar Sair de conta como se visitante tivesse sessão.
Proposta alternativa futura de `Voltar à apresentação` precisa rótulo próprio e
não pode apagar dados locais. Reset/exclusão de dados exige fluxo separado de
confirmação, fora desta entrega.

Card de conquistas: tocar linha expande `Como obter`, progresso atual/meta e
data quando conquistada. Uma expandida por vez. Barra limitada 0–100%, faltam
=max(meta-atual,0). Estado bloqueado usa ícone/label e contraste legível; não
ocultar explicação necessária. `Ver recompensas` abre rota rewards, novo acesso
explícito porque a rota da exportação existe mas não tem entrada clara na UI.

Conquistas usam **mesmo** catálogo e mesmas métricas de Recompensas. Não copiar
os dois arrays divergentes de Profile/Rewards. Ocultas sem regra ficam fora da
lista ativa; nome/catálogo final pendente de confirmação. Datas reais formatadas
em pt-BR. Não atribuir mérito por tomar medicamento ou fazer ligação.

## Dados, estados e implementação

View model deriva de ProgressRepository, eventos de leitura real e catálogo
versionado comum. Nenhum contador incrementado pela screen. Não pedir conta/rede
para ver dados locais; sem sync entre aparelhos. Metadados institucionais e equipe
em arquivo separado de código visual, revisados pela equipe antes de exibição.

Estados: carregando, visitante sem atividade, atividade real, falha de leitura
com repetir, conquista expandida e lista ampliada. Erro em progresso não deve
esconder Sobre. Tema favorito por contagem não é interesse clínico inferido; sem
telemetria externa. Mudanças em Quiz/leituras atualizam após foco sem reinstalar.
ScrollView/FlatList com seções; sobreposição avatar/header deve crescer com texto
para não recortar identidade. Calendário se usado segue contrato comum.

## Critérios de aceite e testes

- PE01: visitante novo não vê identidade/estatísticas de Maria Silva.
- PE02: concluir quiz reflete no perfil uma vez; reabrir resultado não duplica.
- PE03: XP, sequência, conquistas e leituras batem com seus repositórios.
- PE04: cinco primeiras/lista completa e expandir/recolher funcionam com TalkBack.
- PE05: erros têm recuperação; dados reais indisponíveis não viram demonstração.
- PE06: Sobre conserva hierarquia institucional com logos contain e créditos revisados.
- PE07: nenhuma engrenagem/lápis/logout fica como ação sem efeito.

Jest: selectors/agregação; RNTL: vazios, lista, accordion e erro;
Maestro: quiz concluído → Perfil → Recompensas e consistência dos números.
Pendentes: edição de perfil, contas/sync e autorização dos créditos institucionais.
