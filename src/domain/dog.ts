import { firestore } from 'firebase';

export enum DogSex {
  IVAROS_KAN = 'Ivaros kan',
  IVAROS_SZUKE = 'Ivaros szuka',
  IVARTALAN_KAN = 'Ivartalan kan',
  IVARTALAN_SZUKA = 'Ivartalan szuka'
}

export const dogSexArray = Object.keys(DogSex).map(key => ({ key, value: DogSex[key] }))

export class Dog {
  constructor(
    public name: string,
    public birthDate: Date | firestore.Timestamp,
    public breed: string,
    public dogSex: DogSex,
    public chipNumber: string,
    public owner: string,
    public address: string,
    public createdAt: Date | firestore.Timestamp,
    public createdBy: string,
    public ownerPhone: string | null,
    public ownerEmail: string | null,
  ) { }

}
