import * as admin from 'firebase-admin'
import * as moment from 'moment'
import { DocumentEntry, DocumentType, ExpiringDocument } from '../../src/domain/document'
import { Dog } from '../../src/domain/dog'

const expiringDocumenTypes: { type: string, expiresAfterDay: number }[] = [
  { type: 'HEALTH_CERTIFICATE', expiresAfterDay: 365 },
  { type: 'ADI_THERAPY_CERTIFICATES', expiresAfterDay: 365 },
  { type: 'MATESZE_THERAPY_CERTIFICATES', expiresAfterDay: 365 * 2 },
]

const expDocsRef = () => admin.firestore().collection('expiring-documents')

/**
 * Manually sorted in decreasing order.
 */
const daysBeforeExpiry = 30

async function activeExpiringDocuments(): Promise<ExpiringDocument[]> {
  const expDocs = (await expDocsRef().get()).docs
  console.log('Already annotated expiring documents', expDocs)
  return expDocs.map(d => d.data() as ExpiringDocument)
}

/**
 * Returns true if dog needs a valid document
 * @param dog assistance dog
 * @param docType document type to check
 */
function doesDogNeedDocument(dog: Dog, docType: DocumentType): boolean {
  if (dog.trainingMileStones) {
    const hasAnyExam = Object.values(dog.trainingMileStones).filter(f => f.examDate).length
    return hasAnyExam > 0
  } else {
    return false
  }
}

async function getAllExpiringDocuments(): Promise<ExpiringDocument[]> {
  const maxDaysToLookBack = Math.max(...expiringDocumenTypes.map(t => t.expiresAfterDay))
  const searchFromDate = moment().subtract(maxDaysToLookBack - daysBeforeExpiry, 'days')
  console.log('Searching after date warning date', searchFromDate)

  const allDogs = await admin.firestore().collection('dogs').get()
  const missingDocs: ExpiringDocument[] = []

  for (const dogDoc of allDogs.docs) {
    const dog = dogDoc.data() as Dog
    const recentStorageDocs = await admin.firestore()
      .collection('dogs').doc(dogDoc.id)
      .collection('documents').where('documentDate', '>=', searchFromDate)
      .orderBy('documentDate', 'desc')
      .get()

    // if there is no docs after the warning date it means it is missing and need to be uploaded
    // get only the most recent documents by type. it is sorted in desc order by documentDate
    const availableDocs: DocumentEntry[] = []
    recentStorageDocs.docs.map(d => d.data() as DocumentEntry).forEach(d => {
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
        console.log('dogname', dog.name, 'expiry after date', expiryAfterDays, 'prev document', prevDocument)
        if (prevDocument && expiryAfterDays) {
          const warningDate = moment().subtract(expiryAfterDays, 'days')
          const docDate = moment((prevDocument.documentDate as any).toDate())
          console.log('warning date', warningDate, 'doc date', docDate)
          if (docDate.isSame(warningDate, 'days')) {
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


export const checkExpiringDocuments = async () => {
  const activeExpDocs = await activeExpiringDocuments()
  const allExpDocs = await getAllExpiringDocuments()
  // new expiring docs which are not in the active list
  const newExpiringDocs = allExpDocs.filter(expDoc => !activeExpDocs.find(ac => ac.dogId === expDoc.dogId))
  if (newExpiringDocs.length) {
    // await saveNewExpiringDocs(newExpiringDocs)
    return null
  } else {
    console.log('No new expiring documents')
  }
  return null
}
