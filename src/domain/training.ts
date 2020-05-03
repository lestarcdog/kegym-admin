
export enum TrainingType {
  SIT = 'Ül / Sit',
  DOWN = 'Fekszik / Down'
}


export const trainingTypesArray = Object.keys(TrainingType).map((key) => ({ key, value: TrainingType[key] }))

export interface TrainingEntry {
  date: Date
  type: TrainingType
  progress: number
  comment: string | null
}
