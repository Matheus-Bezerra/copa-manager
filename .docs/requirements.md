# Requirements

## Visão Geral

O Copa Manager é uma plataforma para criação, gerenciamento e acompanhamento de campeonatos esportivos.

A plataforma permite que organizadores criem campeonatos com regras personalizadas, gerenciem equipes e jogadores, registrem eventos de partidas e disponibilizem informações públicas para participantes e espectadores.

O sistema deve suportar diferentes formatos de competição, permitindo reutilização para campeonatos de futebol, futsal, vôlei, e-sports e outros esportes (porém agora mais focado no futebol).

---

# Objetivos

* Centralizar a gestão de campeonatos.
* Automatizar classificação e estatísticas.
* Permitir regulamentos personalizados.
* Disponibilizar acompanhamento público dos torneios.
* Possibilitar múltiplos campeonatos independentes na mesma plataforma.

---

# Perfis de Usuário

## Owner

Responsável principal pelo campeonato.

Permissões:

* Criar campeonato.
* Editar configurações do campeonato.
* Editar regulamento.
* Gerenciar permissões.
* Convidar usuários.
* Promover e remover administradores.
* Encerrar campeonato.
* Excluir campeonato.

---

## Administrator

Responsável pela administração operacional do campeonato.

Permissões:

* Gerenciar times.
* Gerenciar jogadores.
* Gerenciar partidas.
* Registrar resultados.
* Registrar eventos das partidas.
* Gerenciar fases.
* Convidar organizadores.

Restrições:

* Não pode excluir campeonato.
* Não pode transferir propriedade.
* Não pode remover o Owner.

---

## Organizer

Responsável pela operação do campeonato.

Permissões:

* Registrar partidas.
* Registrar placares.
* Registrar gols.
* Registrar cartões.
* Registrar premiações de partida.
* Atualizar informações operacionais.

Restrições:

* Não pode alterar regras.
* Não pode alterar permissões.
* Não pode gerenciar administradores.

---

## Public Viewer

Usuário não autenticado.

Permissões:

* Visualizar campeonatos públicos.
* Visualizar classificação.
* Visualizar partidas.
* Visualizar estatísticas.
* Visualizar regulamento.
* Visualizar premiações.

Não possui permissões de edição.

---

# Campeonatos

Um usuário pode criar múltiplos campeonatos.

Cada campeonato deve possuir:

* Nome (único na plataforma).
* Descrição.
* Regulamento.
* Data de abertura.
* Data de início.
* Data de encerramento.
* Status.

O nome do campeonato deve ser único na plataforma. Nomes que geram o mesmo identificador público (`slug`) são tratados como duplicados.

Status possíveis:

* Draft
* Open
* In Progress
* Finished
* Archived

---

# Convites

O sistema deve permitir o envio de convites para participação administrativa em campeonatos.

Um convite deve:

* Estar vinculado a um campeonato.
* Possuir papel definido.
* Possuir prazo de validade.
* Poder ser aceito apenas uma vez.

Papéis permitidos em convites:

* Administrator
* Organizer

O acesso público não requer convite.

---

# Times

O sistema deve permitir:

* Criar times.
* Editar times.
* Remover times.
* Associar jogadores aos times.
* Definir identidade visual do time.

---

# Jogadores

O sistema deve permitir:

* Cadastrar jogadores.
* Associar jogadores a times.
* Registrar estatísticas.
* Registrar histórico disciplinar.
* Registrar participação em partidas.

O jogador não precisa possuir conta de usuário.

---

# Partidas

O sistema deve permitir:

* Agendar partidas.
* Alterar partidas.
* Cancelar partidas.
* Registrar resultado final.
* Registrar disputa por pênaltis.
* Registrar eventos da partida.

---

# Eventos da Partida

O sistema deve suportar:

* Gol.
* Cartão amarelo.
* Cartão vermelho.
* Melhor jogador da partida.

Todos os eventos devem impactar automaticamente estatísticas e classificações relacionadas.

---

# Sistema de Classificação

O sistema deve calcular automaticamente:

* Pontuação.
* Vitórias.
* Empates.
* Derrotas.
* Gols marcados.
* Gols sofridos.
* Saldo de gols.

O cálculo deve respeitar as regras configuradas no campeonato.

---

# Regras Personalizadas

Cada campeonato pode definir suas próprias regras.

Exemplos:

* Pontos por vitória.
* Pontos por empate.
* Pontos bônus por pênaltis.
* Critérios de desempate.
* Regras disciplinares.
* Formato de classificação.

As regras devem ser configuráveis sem necessidade de alteração de código.

---

# Fases

O sistema deve suportar fases de campeonato organizadas em sequência.

Cada fase possui um **tipo** que define o comportamento e a visualização:

* **GROUP_STAGE** — fase com classificação em tabela (grupos, pontos corridos, turno único, turno e returno).
* **KNOCKOUT** — fase eliminatória (mata-mata, oitavas, 16 avos, 32 avos, quartas, semifinal, final).

O **nome** da fase é definido livremente pelo organizador e serve como rótulo de exibição. Exemplos de nome (não de tipo):

* "Grupos"
* "Pontos Corridos"
* "Turno e Returno"
* "Oitavas de Final"
* "16 avos de Final"
* "Semifinal"
* "Final"

Formatos específicos como turno único, turno e returno ou oitavas **não** são tipos distintos — o **formato** da fase (`ROUND_ROBIN`, `DOUBLE_ROUND_ROBIN`) e o **nome** livre definem o comportamento e o rótulo de exibição.

## Sequência

As fases devem poder ser organizadas em sequência via ordem de exibição.

* Na **criação individual** de fase, a ordem é **atribuída automaticamente pelo backend** (próximo valor sequencial no campeonato).
* No **setup em lote**, o organizador informa `order` explicitamente para cada fase.

Exemplo: Grupos → Oitavas → Quartas → Semifinal → Final.

## Formato (GROUP_STAGE)

Fases do tipo `GROUP_STAGE` devem informar um **formato** que define como as rodadas são geradas:

* **ROUND_ROBIN** — turno único: cada time joga uma vez contra cada adversário do grupo.
* **DOUBLE_ROUND_ROBIN** — turno e returno: cada confronto acontece duas vezes (ida e volta).

A geração automática de rodadas usa o maior número de times informado entre os grupos da fase:

* `ROUND_ROBIN` com N times → `(N × (N - 1)) / 2` rodadas.
* `DOUBLE_ROUND_ROBIN` com N times → `N × (N - 1)` rodadas.

## Mata-Mata (KNOCKOUT)

Fases do tipo `KNOCKOUT` devem informar:

* **qualifiedTeams** — quantidade de times classificados para a fase (deve ser potência de 2: 2, 4, 8, 16, 32...).
* **thirdPlaceMatch** — se `true`, gera rodada extra de disputa de 3º lugar em paralelo à final.

O backend gera automaticamente as rodadas com base em `qualifiedTeams` e auto-nomeia cada rodada:

| qualifiedTeams | Rodadas geradas (ordem) |
| --- | --- |
| 32 | 16 Avos, Oitavas, Quartas, Semifinal, Final |
| 16 | Oitavas, Quartas, Semifinal, Final |
| 8 | Quartas, Semifinal, Final |
| 4 | Semifinal, Final |
| 2 | Final |

Se `thirdPlaceMatch` for `true`, uma rodada adicional **3º Lugar** é criada em paralelo à rodada **Final**.

## Grupos

Toda fase do tipo `GROUP_STAGE` deve possuir um ou mais grupos.

* Um campeonato com tabela única pode ter um único grupo (ex.: "Geral").
* Campeonatos com fase de grupos podem ter múltiplos grupos (ex.: "Grupo A", "Grupo B", "Grupo C").
* A classificação é calculada separadamente por grupo.
* Na **criação individual** de grupo, a ordem é **atribuída automaticamente pelo backend** (próximo valor sequencial na fase).
* No **setup em lote**, a ordem dos grupos segue a posição no array enviado.

## Rodadas

As partidas devem ser organizadas em **rodadas** dentro de cada fase.

* Toda partida pertence a exatamente uma rodada (último nível da hierarquia antes da partida).
* No **setup em lote**, o backend gera rodadas automaticamente com base no formato (`GROUP_STAGE`) ou em `qualifiedTeams` (`KNOCKOUT`).
* Na **criação individual** de rodada, o `number` é **atribuído automaticamente pelo backend** (próximo valor sequencial na fase).
* O nome da rodada é opcional na criação individual; no setup em lote, o backend define nomes padrão (ex.: "Rodada 1", "Oitavas", "Final").
* Após o setup, rodadas podem ser criadas, editadas ou removidas manualmente.

## Setup em Lote

O sistema deve permitir criar toda a estrutura de fases de uma vez via endpoint dedicado.

O payload define fases, grupos (quando aplicável) e metadados para geração de rodadas. O backend persiste stages, groups e rounds em uma única operação.

Exemplo:

```json
{
  "stages": [
    {
      "name": "Fase de Grupos",
      "type": "GROUP_STAGE",
      "order": 1,
      "format": "ROUND_ROBIN",
      "groups": [
        { "name": "Grupo A", "teams": 4 },
        { "name": "Grupo B", "teams": 4 }
      ]
    },
    {
      "name": "Mata-Mata",
      "type": "KNOCKOUT",
      "order": 2,
      "qualifiedTeams": 4,
      "thirdPlaceMatch": true
    }
  ]
}
```

Os endpoints individuais de criação de fase, grupo e rodada **complementam** o setup em lote para ajustes posteriores.

## Visualização

O tipo da fase determina a visualização principal no frontend:

* **GROUP_STAGE**: tabela de classificação por grupo e listagem ou agenda de partidas por rodada.
* **KNOCKOUT**: visualização em mapa ou chave, conectando fases eliminatórias em sequência. Cada fase `KNOCKOUT` usa seu `name` como rótulo no mapa (oitavas, 16 avos, etc.), sem necessidade de tipos adicionais.

---

# Premiações

O sistema deve suportar:

* Artilheiro.
* Melhor jogador da partida.
* Melhor jogador do torneio.
* Fair Play.

As regras de definição das premiações devem ser configuráveis.

---

# Estatísticas

O sistema deve disponibilizar estatísticas individuais e coletivas.

Exemplos:

## Jogadores

* Jogos disputados.
* Gols.
* Cartões amarelos.
* Cartões vermelhos.
* Premiações recebidas.

## Times

* Pontuação.
* Vitórias.
* Empates.
* Derrotas.
* Gols marcados.
* Gols sofridos.
* Saldo de gols.

---

# Portal Público

Cada campeonato deve possuir uma página pública.

A página pública deve disponibilizar:

* Regulamento.
* Classificação.
* Calendário.
* Resultados.
* Estatísticas.
* Premiações.
* Elencos.

O acesso deve ocorrer sem autenticação.

---

# Requisitos Não Funcionais

* Suporte a múltiplos campeonatos simultâneos.
* Isolamento completo entre campeonatos.
* Auditoria das alterações administrativas.
* Escalabilidade para crescimento de usuários e campeonatos.
* Interface adequada para dispositivos móveis e desktop.
* Permissões baseadas em papéis.
