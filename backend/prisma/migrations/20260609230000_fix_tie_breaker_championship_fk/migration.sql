-- TieBreakerRule.championship_id must reference championships.id (not championship_rules.id)
ALTER TABLE "tie_breaker_rules" DROP CONSTRAINT "tie_breaker_rules_championship_id_fkey";

ALTER TABLE "tie_breaker_rules" ADD CONSTRAINT "tie_breaker_rules_championship_id_fkey"
  FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
