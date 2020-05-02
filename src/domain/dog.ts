import { firestore } from 'firebase';

export class Dog {
  constructor(
    public name: string,
    public birthDate: Date | firestore.Timestamp,
    public chipNumber: string,
    public owner: string,
    public address: string,
    public createdAt: Date | firestore.Timestamp,
    public createdBy: string,
    public ownerPhone: string | null,
    public ownerEmail: string | null,
  ) { }

}
