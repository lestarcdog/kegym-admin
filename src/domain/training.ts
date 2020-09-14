export class TrainingType {
  // firebase auto generated uid
  id?: string
  hu: string
  en?: string
  createdAt: Date
  createdBy: string
  deleted?: Date
}

export interface TrainingEntry {
  date: Date
  type: TrainingType
  progress: number
  comment: string | null
  createdAt: Date
  createdBy: string
}
