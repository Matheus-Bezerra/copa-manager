-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('GROUP_STAGE', 'KNOCKOUT');

-- CreateEnum
CREATE TYPE "StageFormat" AS ENUM ('ROUND_ROBIN', 'DOUBLE_ROUND_ROBIN');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchEventType" AS ENUM ('GOAL', 'YELLOW_CARD', 'RED_CARD', 'MVP');

-- CreateEnum
CREATE TYPE "BracketLinkOutcome" AS ENUM ('WINNER', 'LOSER');

-- CreateEnum
CREATE TYPE "BracketLinkSlot" AS ENUM ('HOME', 'AWAY');

-- CreateEnum
CREATE TYPE "AwardType" AS ENUM ('TOP_SCORER', 'MATCH_MVP', 'TOURNAMENT_MVP', 'FAIR_PLAY');

-- CreateTable
CREATE TABLE "stages" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StageType" NOT NULL,
    "format" "StageFormat",
    "teams_to_advance" INTEGER NOT NULL DEFAULT 1,
    "qualified_teams" INTEGER,
    "third_place_match" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "group_id" TEXT,
    "home_team_id" TEXT,
    "away_team_id" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "home_score" INTEGER NOT NULL,
    "away_score" INTEGER NOT NULL,
    "home_penalty_score" INTEGER,
    "away_penalty_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player_id" TEXT,
    "team_id" TEXT,
    "event_type" "MatchEventType" NOT NULL,
    "minute" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_bracket_links" (
    "id" TEXT NOT NULL,
    "from_match_id" TEXT NOT NULL,
    "to_match_id" TEXT NOT NULL,
    "outcome" "BracketLinkOutcome" NOT NULL,
    "to_slot" "BracketLinkSlot" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_bracket_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standings" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goals_scored" INTEGER NOT NULL DEFAULT 0,
    "goals_conceded" INTEGER NOT NULL DEFAULT 0,
    "goal_difference" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "championship_rules" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "win_points" INTEGER NOT NULL DEFAULT 3,
    "draw_points" INTEGER NOT NULL DEFAULT 1,
    "penalty_bonus_points" INTEGER NOT NULL DEFAULT 0,
    "yellow_cards_for_suspension" INTEGER NOT NULL DEFAULT 3,
    "red_card_suspension_games" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "championship_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tie_breaker_rules" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "criterion" TEXT NOT NULL,

    CONSTRAINT "tie_breaker_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "awards" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "award_type" "AwardType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stages_championship_id_idx" ON "stages"("championship_id");

-- CreateIndex
CREATE INDEX "stages_display_order_idx" ON "stages"("display_order");

-- CreateIndex
CREATE INDEX "groups_stage_id_idx" ON "groups"("stage_id");

-- CreateIndex
CREATE INDEX "groups_display_order_idx" ON "groups"("display_order");

-- CreateIndex
CREATE INDEX "rounds_stage_id_idx" ON "rounds"("stage_id");

-- CreateIndex
CREATE UNIQUE INDEX "rounds_stage_id_number_key" ON "rounds"("stage_id", "number");

-- CreateIndex
CREATE INDEX "matches_championship_id_idx" ON "matches"("championship_id");

-- CreateIndex
CREATE INDEX "matches_round_id_idx" ON "matches"("round_id");

-- CreateIndex
CREATE INDEX "matches_group_id_idx" ON "matches"("group_id");

-- CreateIndex
CREATE INDEX "matches_scheduled_at_idx" ON "matches"("scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_match_id_key" ON "match_results"("match_id");

-- CreateIndex
CREATE INDEX "match_events_match_id_idx" ON "match_events"("match_id");

-- CreateIndex
CREATE INDEX "match_events_player_id_idx" ON "match_events"("player_id");

-- CreateIndex
CREATE INDEX "match_events_event_type_idx" ON "match_events"("event_type");

-- CreateIndex
CREATE UNIQUE INDEX "match_bracket_links_from_match_id_outcome_key" ON "match_bracket_links"("from_match_id", "outcome");

-- CreateIndex
CREATE INDEX "standings_championship_id_idx" ON "standings"("championship_id");

-- CreateIndex
CREATE INDEX "standings_stage_id_idx" ON "standings"("stage_id");

-- CreateIndex
CREATE INDEX "standings_group_id_idx" ON "standings"("group_id");

-- CreateIndex
CREATE INDEX "standings_position_idx" ON "standings"("position");

-- CreateIndex
CREATE UNIQUE INDEX "standings_stage_id_group_id_team_id_key" ON "standings"("stage_id", "group_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "championship_rules_championship_id_key" ON "championship_rules"("championship_id");

-- CreateIndex
CREATE INDEX "tie_breaker_rules_championship_id_idx" ON "tie_breaker_rules"("championship_id");

-- CreateIndex
CREATE UNIQUE INDEX "tie_breaker_rules_championship_id_position_key" ON "tie_breaker_rules"("championship_id", "position");

-- CreateIndex
CREATE INDEX "awards_championship_id_idx" ON "awards"("championship_id");

-- CreateIndex
CREATE INDEX "awards_player_id_idx" ON "awards"("player_id");

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_bracket_links" ADD CONSTRAINT "match_bracket_links_from_match_id_fkey" FOREIGN KEY ("from_match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_bracket_links" ADD CONSTRAINT "match_bracket_links_to_match_id_fkey" FOREIGN KEY ("to_match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "championship_rules" ADD CONSTRAINT "championship_rules_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tie_breaker_rules" ADD CONSTRAINT "tie_breaker_rules_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championship_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
