import { firestore } from 'firebase';

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

export class Dog {
  constructor(
    public name: string,
    public birthDate: Date | firestore.Timestamp,
    public breed: string,
    public dogSex: DogSex,
    public assistanceType: AssistanceDogType,
    public chipNumber: string,
    public owner: string,
    public address: string,
    public createdAt: Date | firestore.Timestamp,
    public createdBy: string,
    public ownerPhone: string | null,
    public ownerEmail: string | null,
  ) { }

}
