import moment from 'moment'
import { DocumentEntry, ExpiringDocument } from "../../src/domain/document"
import { AssistanceDogType, Dog, DogSex, Organization } from "../../src/domain/dog"
import { getAllNewExpiringDocs } from "./expiring-documents"

type FirebaseDoc = FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
type FirebaseDocRet = Promise<FirebaseDoc[]>

let mockAllDogs
let mockAllExpiringDocs
let mockActiveDocs

jest.mock('./expiring-documents-service', () => ({
  expDocsRef: jest.fn(),
  getActiveExpiringDocuments: jest.fn<any, any>(() => mockActiveDocs),
  getAllDogs: jest.fn<FirebaseDocRet, any>(() => mockAllDogs),
  getAllExpiringDocsCandidates: jest.fn<FirebaseDocRet, any>(() => mockAllExpiringDocs),
}))

const TEST_DATE = new Date(2020, 4, 1)

describe('expiring documents', () => {

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => TEST_DATE.valueOf())
    mockAllDogs = Promise.resolve([] as FirebaseDoc[])
    mockAllExpiringDocs = Promise.resolve([] as FirebaseDoc[])
    mockActiveDocs = Promise.resolve([] as FirebaseDoc[])
  })

  function createNewDog(name: string, examDate?: Date) {
    return {
      name,
      birthDate: new Date(),
      breed: '',
      chipNumber: '',
      createdAt: new Date(),
      createdBy: '',
      dogSex: DogSex.IVAROS_KAN,
      owner: { name: '', phone: '', },
      trainer: {
        email: '', name: '', phone: '', trainerId: '', createdAt: new Date(), createdBy: ''
      },
      assistanceTypes: [AssistanceDogType.THERAPY],
      organization: [Organization.MATESZE],
      trainingMileStones: {
        'THERAPY': {
          examDate,
          createdAt: new Date(),
          createdBy: ''
        }
      }
    } as Dog
  }

  function createDocumentEntry(docType: string, docDate: Date): DocumentEntry {
    return {
      type: docType,
      documentDate: { toDate: () => docDate } as any,
      fileType: '',
      downloadUrl: '',
      createdAt: new Date(),
      createdBy: ''
    } as DocumentEntry
  }

  function createExpiringDoc(dogId: string, docType: string): ExpiringDocument {
    return {
      dogId,
      expiryDate: new Date(),
      missingDocumentType: docType,
      prevDocument: null
    } as ExpiringDocument
  }

  function wrapSnapshot(t: any, id: string = 'id'): FirebaseFirestore.QueryDocumentSnapshot {
    return {
      id,
      data: () => t
    } as FirebaseFirestore.QueryDocumentSnapshot
  }

  function minusDays(n: number): Date {
    return moment(TEST_DATE).subtract(n, 'days').toDate()
  }

  it('should run without dogs', async () => {
    const result = await getAllNewExpiringDocs()
    expect(result).toHaveLength(0)
  })

  it('should include dogs which has exam date set in the past and never uploaded docs', async () => {
    mockAllDogs = Promise.resolve([wrapSnapshot(createNewDog('bömbi', minusDays(700)))])
    const result = await getAllNewExpiringDocs()
    expect(result).toHaveLength(2)
    expect(result[0].missingDocumentType).toBe('HEALTH_CERTIFICATE')
    expect(result[0].prevDocument).toBeNull()
    expect(result[1].missingDocumentType).toBe('MATESZE_THERAPY_CERTIFICATES')
    expect(result[1].prevDocument).toBeNull()
  })

  it('should not include dogs which has exam date set in the future', async () => {
    mockAllDogs = Promise.resolve([wrapSnapshot(createNewDog('bömbi', minusDays(-100)))])
    const result = await getAllNewExpiringDocs()
    expect(result).toHaveLength(0)
  })

  it('should include dogs which has exam date set in past and exactly uploaded docs', async () => {
    mockAllDogs = Promise.resolve([wrapSnapshot(createNewDog('bömbi', minusDays(800)))])
    mockAllExpiringDocs = Promise.resolve([
      wrapSnapshot(createDocumentEntry('HEALTH_CERTIFICATE', minusDays(365 - 30))),
      wrapSnapshot(createDocumentEntry('MATESZE_THERAPY_CERTIFICATES', minusDays(365 * 2)))
    ])
    const result = await getAllNewExpiringDocs()
    expect(result).toHaveLength(2)
    expect(result[0].missingDocumentType).toBe('HEALTH_CERTIFICATE')
    expect(result[0].prevDocument).toBeDefined()
    expect(result[1].missingDocumentType).toBe('MATESZE_THERAPY_CERTIFICATES')
    expect(result[1].prevDocument).toBeDefined()
  })

  it('should not report again missing docs if it has been already reported', async () => {
    mockAllDogs = Promise.resolve([wrapSnapshot(createNewDog('bömbi', minusDays(800)), 'dogId')])
    mockActiveDocs = Promise.resolve([wrapSnapshot(createExpiringDoc('dogId', 'HEALTH_CERTIFICATE'))])
    const result = await getAllNewExpiringDocs()
    expect(result).toHaveLength(1)
    expect(result[0].missingDocumentType).toBe('MATESZE_THERAPY_CERTIFICATES')
  })
})
