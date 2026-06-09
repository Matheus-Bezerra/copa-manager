export interface Group {
  id: string
  stageId: string
  name: string
  displayOrder: number
  createdAt: Date
}

export interface CreateGroupInput {
  id: string
  stageId: string
  name: string
  displayOrder: number
}

export interface UpdateGroupInput {
  name?: string
  displayOrder?: number
}

export interface GroupRepository {
  findById(id: string): Promise<Group | null>
  findByStageId(stageId: string): Promise<Group[]>
  findMaxDisplayOrder(stageId: string): Promise<number>
  create(data: CreateGroupInput): Promise<Group>
  update(id: string, data: UpdateGroupInput): Promise<Group>
  delete(id: string): Promise<void>
}
