import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Team, TeamRepository } from '@/repositories/team-repository'

export interface PublicTeam {
  id: string
  name: string
  shortName: string | null
  logoUrl: string | null
  primaryColor: string | null
  secondaryColor: string | null
}

export class ListPublicTeamsUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

  async execute(request: { slug: string }): Promise<{ teams: PublicTeam[] }> {
    const championship = await this.championshipRepository.findBySlug(request.slug)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const teams = await this.teamRepository.findByChampionshipId(championship.id)

    return {
      teams: teams.map(toPublicTeam),
    }
  }
}

function toPublicTeam(team: Team): PublicTeam {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    logoUrl: team.logoUrl,
    primaryColor: team.primaryColor,
    secondaryColor: team.secondaryColor,
  }
}
