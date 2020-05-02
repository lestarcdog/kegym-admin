export class Dog {
  constructor(
    public name: string,
    public birthDate: Date,
    public chipNumber: string,
    public owner: string,
    public address: string,
    public createdAt: Date,
    public createdBy: string,
    public ownerPhone: string | null,
    public ownerEmail: string | null,
  ) { }

}
