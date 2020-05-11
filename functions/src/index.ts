import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { checkExpiringDocuments } from './expiring-documents'

admin.initializeApp()

export const checkDocumentExpiration = functions.pubsub.schedule('every 24 hours').timeZone('Europe/Berlin').onRun(async (ctx) => {
  console.log('Running expiring documents check', ctx, ctx.timestamp)
  await checkExpiringDocuments()
  console.log('done running')
  return null
})
