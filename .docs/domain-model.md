# Domain Model

## Visão Geral

O domínio do Copa Manager é responsável pela gestão de campeonatos esportivos, incluindo administração, equipes, jogadores, partidas, classificação, eventos de jogo e premiações.

Este documento descreve exclusivamente o modelo de negócio, sem considerar persistência, banco de dados, APIs ou tecnologias específicas.

---

# Bounded Contexts

O domínio é dividido nos seguintes contextos:

* Identity & Access
* Championship Management
* Team Management
* Match Management
* Statistics & Ranking
* Awards

---

# Entidades

## User

Representa uma pessoa autenticada na plataforma.

### Responsabilidades

* Criar campeonatos.
* Administrar campeonatos.
* Receber convites.
* Operar campeonatos.

### Atributos

* id
* name
* email
* avatarUrl

---

## Championship

Representa um campeonato.

### Responsabilidades

* Centralizar regras.
* Centralizar participantes.
* Centralizar fases.
* Controlar o ciclo de vida do torneio.

### Atributos

* id
* name
* description
* regulations
* startDate
* endDate
* status

### Regras

* Possui exatamente um Owner.
* Pode possuir múltiplos Administrators.
* Pode possuir múltiplos Organizers.
* Possui uma ou mais fases.
* Possui uma ou mais equipes.

---

## ChampionshipMember

Representa a participação administrativa de um usuário em um campeonato.

### Responsabilidades

* Controlar permissões.
* Definir papel do usuário no campeonato.

### Atributos

* userId
* championshipId
* role

---

## Invitation

Representa um convite administrativo.

### Responsabilidades

* Conceder acesso administrativo.
* Vincular usuário ao campeonato.

### Atributos

* id
* email
* role
* expirationDate
* status

### Regras

* Só pode ser aceito uma vez.
* Pode expirar.
* Deve estar vinculado a um campeonato.

---

## Team

Representa uma equipe participante.

### Responsabilidades

* Participar de partidas.
* Acumular estatísticas.
* Agrupar jogadores através de inscrições.

### Atributos

* id
* name
* shortName
* logo
* primaryColor

### Regras

* Deve pertencer a um campeonato.
* Deve possuir ao menos um jogador para participar.

---

## Player

Representa um atleta.

### Responsabilidades

* Participar de partidas.
* Acumular estatísticas.
* Receber premiações.
* Receber punições.
* Participar de equipes através de inscrições.

### Atributos

* id
* name
* shirtNumber

### Regras

* Pode participar de múltiplos campeonatos.
* Pode possuir estatísticas acumuladas.
* Não pertence diretamente a uma equipe.

---

## TeamMembership

Representa a inscrição de um jogador em uma equipe dentro de um campeonato.

### Responsabilidades

* Associar jogador a uma equipe.
* Controlar histórico de participação.
* Permitir futuras transferências.

### Atributos

* id
* playerId
* teamId
* joinedAt

### Regras

* Um jogador pode possuir múltiplas inscrições ao longo do tempo.
* Apenas uma inscrição ativa por campeonato.
* Toda participação em equipe ocorre através desta entidade.

---

## PlayerStatistics

Representa os indicadores estatísticos de um jogador dentro de um campeonato.

### Responsabilidades

* Consolidar desempenho individual.
* Permitir importação de histórico.
* Permitir ajustes administrativos.

### Atributos

* matchesPlayed
* goals
* assists
* yellowCards
* redCards
* matchMVPs

### Regras

* Pertence a um jogador dentro de um campeonato.
* Pode ser inicializada manualmente.
* É atualizada automaticamente por eventos de partidas.

---

## Stage

Representa uma fase do campeonato.

### Tipos

* **GroupStage** — fase com classificação em tabela.
* **Knockout** — fase eliminatória.

### Exemplos de name (rótulo livre)

* "Grupos"
* "Pontos Corridos"
* "Turno e Returno"
* "Oitavas de Final"
* "16 avos de Final"
* "Semifinal"
* "Final"

### Atributos

* id
* name
* type
* order
* format (apenas GroupStage)
* qualifiedTeams (apenas Knockout)
* thirdPlaceMatch (apenas Knockout)

### Regras

* Pertence a um campeonato.
* Possui uma ou mais rodadas.
* Se do tipo GroupStage, possui ao menos um grupo e deve informar `format`.
* Se do tipo Knockout, não possui grupos nem classificação; deve informar `qualifiedTeams`.
* A ordem (`order`) pode ser informada pelo cliente no setup em lote ou atribuída automaticamente na criação individual.
* A geração automática de rodadas ocorre via setup em lote; após o setup, rodadas podem ser ajustadas manualmente.

---

## Group

Representa uma subdivisão dentro de uma fase do tipo GroupStage.

### Exemplos

* "Grupo A"
* "Grupo B"
* "Geral" (grupo único em formato de tabela simples)

### Atributos

* id
* name
* order

### Regras

* Pertence a um Stage do tipo GroupStage.
* Possui classificação (Standings).
* Partidas de fase de grupos referenciam o grupo.
* A ordem (`order`) é atribuída automaticamente na criação individual; no setup em lote, segue a posição no array enviado.
* A quantidade de times informada no setup em lote (`teams`) é **transiente** — serve só para gerar rodadas; não é atributo persistido do grupo.

---

## Round

Representa uma rodada dentro de uma fase.

### Atributos

* id
* number
* name (opcional)

### Regras

* Pertence a um Stage.
* Possui uma ou mais partidas.
* O `number` define a ordem da rodada dentro da fase.
* O `number` é atribuído automaticamente na criação individual; no setup em lote, é gerado automaticamente com base no formato ou em `qualifiedTeams`.

---

## Match

Representa uma partida.

### Responsabilidades

* Registrar resultado.
* Registrar eventos.
* Impactar classificação.

### Atributos

* id
* scheduledDate
* status

### Regras

* Possui dois times participantes.
* Pertence a uma rodada.
* Em fases GroupStage, pertence também a um grupo.
* Pode gerar eventos.
* Na v1, não existe vínculo automático entre partidas de rodadas consecutivas (sem avanço de vencedor entre rodadas ou fases).

---

## MatchResult

Representa o resultado oficial da partida.

### Atributos

* homeScore
* awayScore
* homePenaltyScore
* awayPenaltyScore

### Regras

* Existe apenas após encerramento da partida.

---

## MatchEvent

Representa um evento ocorrido durante uma partida.

### Responsabilidades

* Registrar acontecimentos relevantes.

### Atributos

* id
* type
* minute

### Tipos possíveis

* Goal
* YellowCard
* RedCard
* MVP

---

## Standing

Representa a classificação de uma equipe dentro de um grupo de uma fase.

### Responsabilidades

* Consolidar desempenho do time no escopo do grupo.

### Atributos

* points
* wins
* draws
* losses
* goalsScored
* goalsConceded
* goalDifference

### Regras

* Sempre derivado dos resultados das partidas do grupo na fase.
* Nunca deve ser editado manualmente.
* Existe apenas em fases do tipo GroupStage.

---

## Award

Representa uma premiação.

### Exemplos

* Top Scorer
* Tournament MVP
* Fair Play

### Atributos

* id
* name
* type

---

# Value Objects

## ChampionshipRules

Representa as regras do campeonato.

### Atributos

* winPoints
* drawPoints
* penaltyBonusPoints
* yellowCardsForSuspension
* redCardSuspensionGames

### Regras

* Deve existir para todo campeonato.
* Pode variar entre campeonatos.

---

## TieBreakerPolicy

Representa a ordem dos critérios de desempate.

### Exemplos

* Wins
* GoalDifference
* GoalsScored
* HeadToHead

---

## TeamScore

Representa o resultado de um time em uma partida.

### Atributos

* regularGoals
* penaltyGoals

---

# Agregados

## Championship Aggregate

Root:

* Championship

Entidades internas:

* ChampionshipMember
* Invitation
* Stage
* Group
* Round
* ChampionshipRules

Responsabilidade:

Garantir integridade estrutural do campeonato.

---

## Team Aggregate

Root:

* Team

Entidades internas:

* TeamMembership

Responsabilidade:

Garantir consistência do elenco.

---

## Player Aggregate

Root:

* Player

Entidades internas:

* PlayerStatistics

Responsabilidade:

Garantir consistência das estatísticas e histórico do atleta.

---

## Match Aggregate

Root:

* Match

Entidades internas:

* MatchResult
* MatchEvent

Responsabilidade:

Garantir consistência dos eventos e resultados da partida.

---

# Enums

## ChampionshipStatus

* Open
* InProgress
* Finished

---

## ChampionshipRole

* Owner
* Administrator
* Organizer

---

## InvitationStatus

* Pending
* Accepted
* Expired

---

## MatchStatus

* Scheduled
* InProgress
* Finished
* Cancelled

---

## MatchEventType

* Goal
* YellowCard
* RedCard
* MVP

---

## StageType

* GroupStage
* Knockout

---

## StageFormat

* RoundRobin
* DoubleRoundRobin

---

## AwardType

* TopScorer
* MatchMVP
* TournamentMVP
* FairPlay

---

# Domain Events

## ChampionshipCreated

Disparado quando um campeonato é criado.

---

## ChampionshipStarted

Disparado quando o campeonato inicia.

---

## ChampionshipFinished

Disparado quando o campeonato é encerrado.

---

## InvitationSent

Disparado quando um convite é criado.

---

## InvitationAccepted

Disparado quando um convite é aceito.

---

## TeamCreated

Disparado quando uma equipe é cadastrada.

---

## PlayerAddedToTeam

Disparado quando um jogador é inscrito em uma equipe.

---

## PlayerTransferred

Disparado quando um jogador muda de equipe.

---

## PlayerStatisticsInitialized

Disparado quando estatísticas iniciais são atribuídas a um jogador.

---

## MatchScheduled

Disparado quando uma partida é criada.

---

## MatchStarted

Disparado quando uma partida inicia.

---

## MatchFinished

Disparado quando uma partida é encerrada.

---

## GoalRegistered

Disparado quando um gol é registrado.

---

## YellowCardRegistered

Disparado quando um cartão amarelo é registrado.

---

## RedCardRegistered

Disparado quando um cartão vermelho é registrado.

---

## MatchMVPDefined

Disparado quando o melhor jogador da partida é definido.

---

## StandingRecalculated

Disparado após atualização da classificação.

---

## AwardGranted

Disparado quando uma premiação é concedida.
