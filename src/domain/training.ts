export class TrainingType {
  hu: string
  en?: string
  createdAt: Date
  createdBy: string
}

export interface TrainingEntry {
  date: Date
  type: TrainingType
  progress: number
  comment: string | null
  createdAt: Date
  createdBy: string
}
