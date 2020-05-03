
export enum TrainingType {
  SIT = 'Ül / Sit',
  DOWN = 'Fekszik / Down',
  STAY = 'Marad / Stay',
  EYE_CONTACT = 'Szemkontaktus / Eye contact',
  KENNEL_TRAINING = 'Kennel tréning / Kennel training',
  FETCH = 'Apport / Fetch',
  INHIBITION = 'Gátlás kialakítása / Inhibition training',
  SPECIAL_TRICK_1 = 'Trükk 1 / Trick 1',
  SPECIAL_TRICK_2 = 'Trükk 2 / Trick 2',
  SPECIAL_TRICK_3 = 'Trükk 3 / Trick 3',
}


export const trainingTypesArray = Object.keys(TrainingType).map((key) => ({ key, value: TrainingType[key] }))

export interface TrainingEntry {
  date: Date
  type: TrainingType
  progress: number
  comment: string | null
  createdAt: Date
  createdBy: string
}
