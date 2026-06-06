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

O sistema deve suportar múltiplos tipos de fase.

Exemplos:

* Fase de grupos.
* Turno único.
* Turno e returno.
* Semifinal.
* Final.
* Mata-mata.

As fases devem poder ser organizadas em sequência.

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
