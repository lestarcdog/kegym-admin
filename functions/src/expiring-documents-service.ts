import * as admin from 'firebase-admin'

export const expDocsRef = () => admin.firestore().collection('expiring-documents')

export const getAllDogs = async () => (await admin.firestore().collection('dogs').get()).docs

export const getAllExpiringDocsCandidates = async (dogId: string) => (await admin.firestore()
  .collection('dogs').doc(dogId)
  .collection('documents')
  .orderBy('documentDate', 'desc')
  .get()).docs


export const getActiveExpiringDocuments = async () => (await expDocsRef().get()).docs
