
export enum DogSex {
  IVAROS_KAN = 'Ivaros kan',
  IVAROS_SZUKE = 'Ivaros szuka',
  IVARTALAN_KAN = 'Ivartalan kan',
  IVARTALAN_SZUKA = 'Ivartalan szuka'
}

export enum AssistanceDogType {
  FACILITY = 'Terápiás / Facility',
  PSYCHIATRIC = 'Személyisegítő / Psychiatric',
  MOBILITY = 'Mozgássegítő / Mobility',
  HEARING = 'Halló / hearing',
  THERAPY = 'Terápiás / Therapy',
  ALARM = 'Jelző / Alarm'
}

export const dogSexArray = Object.keys(DogSex).map(key => ({ key, value: DogSex[key] }))
export const asssistanceDogType = Object.keys(AssistanceDogType).map(key => ({ key, value: AssistanceDogType[key] }))

export class Owner {
  name: string
  address: string
  phone: string
  email: string
}

export class Trainer {
  trainerId: string
  name: string
  email: string
  phone: string
  createdAt: Date
  createdBy: string
}

export class Dog {
  name: string
  birthDate: Date
  breed: string
  dogSex: DogSex
  assistanceType: AssistanceDogType
  chipNumber: string
  trainer: Trainer
  owner: Owner
  createdAt: Date
  createdBy: string
}
