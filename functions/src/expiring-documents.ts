import moment from 'moment'
import { firebaseToMomentDate } from '../../src/app/service/time-util'
import { DocumentEntry, DocumentType, ExpiringDocument } from '../../src/domain/document'
import { Dog, Organization } from '../../src/domain/dog'
import { expDocsRef, getActiveExpiringDocuments, getAllDogs, getAllExpiringDocsCandidates } from './expiring-documents-service'

const MATESZE_THERAPY_CERTIFICATES = 'MATESZE_THERAPY_CERTIFICATES'
const HEALTH_CERTIFICATE = 'HEALTH_CERTIFICATE'

const expiringDocumenTypes: { type: string, expiresAfterDay: number }[] = [
  { type: HEALTH_CERTIFICATE, expiresAfterDay: 365 },
  { type: 'ADI_THERAPY_CERTIFICATES', expiresAfterDay: 365 },
  { type: MATESZE_THERAPY_CERTIFICATES, expiresAfterDay: 365 * 2 },
]

const daysBeforeExpiry = 30

async function activeExpiringDocuments(): Promise<ExpiringDocument[]> {
  const expDocs = await getActiveExpiringDocuments()
  console.log('Already annotated expiring documents', expDocs)
  return expDocs.map(d => d.data() as ExpiringDocument)
}

/**
 * Returns true if dog needs a valid document
 * @param dog assistance dog
 * @param docType document type to check
 */
function doesDogNeedDocument(dog: Dog, docType: string): boolean {
  // ADI documents not required for non-ADI dogs
  if (docType.includes('ADI') && !dog.organization?.includes(Organization.ADI)) {
    return false
  }

  // By default every dog is a matesze dog
  if (dog.trainingMileStones) {
    const now = new Date()
    const trainings = Object.keys(dog.trainingMileStones)

    const isDocTypeAndTrainingMatch = trainingKey => {
      if (trainingKey === 'FACILITY') {
        return docType === MATESZE_THERAPY_CERTIFICATES || docType === HEALTH_CERTIFICATE
      } else {
        return false
      }
    }

    const hasAnyExam = trainings
      .filter(t => isDocTypeAndTrainingMatch(t))
      // sure we have a training milestone present
      .map(k => dog.trainingMileStones![k])
      .filter(f => f.examDate)
      .filter(f => firebaseToMomentDate(f.examDate)?.isBefore(now))
      .length
    return hasAnyExam > 0
  } else {
    return false
  }
}

async function getAllExpiringDocuments(): Promise<ExpiringDocument[]> {
  const allDogs = await getAllDogs()
  const missingDocs: ExpiringDocument[] = []

  for (const dogDoc of allDogs) {
    const dog = dogDoc.data() as Dog
    const recentStorageDocs = await getAllExpiringDocsCandidates(dogDoc.id)

    // if there is no docs after the warning date it means it is missing and need to be uploaded
    // get only the most recent documents by type. it is sorted in desc order by documentDate
    const availableDocs: DocumentEntry[] = []
    recentStorageDocs.map(d => d.data() as DocumentEntry).forEach(d => {
      const isIncluded = availableDocs.find(ad => ad.type === d.type)
      if (!isIncluded) {
        availableDocs.push(d)
      }
    })

    expiringDocumenTypes.forEach(expDocType => {
      if (doesDogNeedDocument(dog, expDocType.type as DocumentType)) {
        const prevDocument = availableDocs.find(d => d.type === expDocType.type) || null

        let isMissing = false
        let expiryDate: Date | null = null

        if (!prevDocument) {
          isMissing = true
        }

        const expiryAfterDays = expiringDocumenTypes.find(e => e.type === prevDocument?.type)?.expiresAfterDay
        console.log('Dog', dog.name, 'expiry after date', expiryAfterDays, 'prev document', prevDocument)
        if (prevDocument && expiryAfterDays) {
          const warningDate = moment().subtract(expiryAfterDays - daysBeforeExpiry, 'days')
          const docDate = moment((prevDocument.documentDate as any).toDate())
          console.log('warning date', warningDate, 'doc date', docDate)
          if (docDate.isSameOrBefore(warningDate, 'days')) {
            isMissing = true
            expiryDate = docDate.add(expiryAfterDays, 'day').toDate()
          }
        }

        if (isMissing) {
          console.debug('Dog', dog.name, 'does not have valid document for', expDocType.type)
          missingDocs.push({
            dogId: dogDoc.id,
            missingDocumentType: expDocType.type as DocumentType,
            prevDocument: prevDocument,
            expiryDate
          })
        }
      }
    })
  }

  console.log('All missing docs', missingDocs)

  return missingDocs
}

//@ts-ignore
async function saveNewExpiringDocs(docs: ExpiringDocument[]) {
  for (const doc of docs) {
    const docId = `${doc.dogId}_${doc.missingDocumentType}`
    try {
      console.info('Saving new expiring document', doc)
      await expDocsRef().doc(docId).set({ ...doc })
    } catch (e) {
      console.error('Failed to new expiring document', doc, e)
    }
  }
}

/**
 * Visible for testing
 */
export const getAllNewExpiringDocs = async () => {
  const activeExpDocs = await activeExpiringDocuments()
  const allExpDocs = await getAllExpiringDocuments()
  // new expiring docs which are not in the active list
  return allExpDocs.filter(expDoc =>
    !activeExpDocs.find(ac =>
      ac.dogId === expDoc.dogId && ac.missingDocumentType === expDoc.missingDocumentType
    )
  )
}


export const checkExpiringDocuments = async () => {
  const newExpiringDocs = await getAllNewExpiringDocs()
  if (newExpiringDocs.length) {
    await saveNewExpiringDocs(newExpiringDocs)
    return null
  } else {
    console.log('No new expiring documents')
  }
  return null
}
