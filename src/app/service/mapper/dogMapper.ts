import { Dog } from 'src/domain/dog';

export function mapFirebaseDog(data: Dog): Dog {
  if (data) {
    return {
      ...data,
      birthDate: (data.birthDate as any).toDate(),
      createdAt: (data.createdAt as any).toDate()
    }
  } else {
    return null
  }
}
