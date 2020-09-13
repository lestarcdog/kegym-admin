import { DogSex, Organization } from 'src/domain/dog'
// test dogs for local testing dog list

export const TEST_DOGS = [
  {
    birthDate: new Date(),
    assistanceTypes: ['ALARM'] as any,
    breed: 'kutya',
    chipNumber: '1234',
    createdAt: new Date(),
    createdBy: 'admin',
    docId: '1234',
    dogSex: DogSex.IVAROS_KAN,
    name: 'Kutya',
    organization: [Organization.ADI],
    owner: {
      name: 'gazda',
    },
    trainer: {
      name: 'Kiképző',
      createdAt: new Date(),
      createdBy: 'admin',
      email: 'email',
      phone: '1234',
      trainerId: 'id',
    }
  },
  {
    birthDate: new Date(),
    assistanceTypes: ['HEARING', 'MOBILITY'] as any,
    breed: 'kutya 2',
    chipNumber: '1234',
    createdAt: new Date(),
    createdBy: 'admin',
    docId: '1234',
    dogSex: DogSex.IVAROS_KAN,
    name: 'bömbi',
    organization: [Organization.ADI],
    owner: {
      name: 'gazda',
    },
    trainer: {
      name: 'kis gazda',
      createdAt: new Date(),
      createdBy: 'admin',
      email: 'email',
      phone: '1234',
      trainerId: 'id',
    }
  },
]
