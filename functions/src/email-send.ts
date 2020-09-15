import * as functions from 'firebase-functions'
import * as nodemailer from 'nodemailer'
import { DocumentType } from '../../src/domain/document'
import { ExpiringData } from './types'


const gmailEmail = functions.config().gmail.email
const gmailPassword = functions.config().gmail.password
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
})

// test data
// const data: ExpiringData = {
//   dog: {
//     name: 'Bömbi',
//     chipNumber: '1234',
//     owner: {
//       name: 'Józsi',
//       email: 'lestarcdog@yahoo.com'
//     }
//   } as any,
//   document: {
//     dogId: '1234',
//     expiryDate: new Date(),
//     missingDocumentType: DocumentType.HEALTH_CERTIFICATE,
//     prevDocument: null
//   }
// }

// const mailTransport = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'XXX',
//     pass: 'YYY',
//   },
// })

//@ts-ignore
export async function sendWarningEmail(data: ExpiringData) {
  const { dog, document } = data
  const { name: ownerName, email } = dog.owner
  if (!email) {
    console.warn(`Dog owner {} doesn't have an email set for dog {}`, ownerName, dog.name)
    return
  }
  const mailOptions: nodemailer.SendMailOptions = {
    from: `Kutyával egy mosolyért <kutyavalegymosolyert@gmail.com>`,
    to: email,
    cc: ['juharosagota@gmail.com', 'kutyaslany.dia@gmail.com']
  }
  console.log('Processing document', document)

  const { prevDocument } = document
  const documentName = DocumentType[document.missingDocumentType]


  const userAction = prevDocument ? 'hamarosan lejár/vagy lejárt' : 'nem lett még feltöltve'
  const lastDocumentRow = prevDocument ? `Utoljára feltöltve: ${prevDocument.documentDate.toLocaleDateString('hu')}` : ''
  const untilExpiration = document.expiryDate ? `A határidő: ${document.expiryDate.toLocaleDateString('hu')}` : 'A határidő: azonnal'

  mailOptions.subject = `Hamarosan lejáró ${documentName} dokumentum: ${dog.name}(${dog.chipNumber})`
  mailOptions.html = `
    Kedves ${ownerName},
    <br />
    <br />
    A <strong>${dog.name}</strong> kutyádhoz tartozó <em>'${documentName}'</em> <strong>${userAction}</strong>.
    <br />
    <strong>${untilExpiration}</strong>
    <br />
    ${lastDocumentRow}
    <br />
    <br />
    Kérlek minél hamarabb küld el a hiányzó dokumentumokat (email) a területi vezetődnek!
    <br />
    <br />
    Üdvözlettel,
    <br />
    KEMA Robot Kutya
  `
  try {
    await mailTransport.sendMail(mailOptions)
    console.log('Warning email sent to:', email)
  } catch (e) {
    console.error('Could not send email to', dog.owner.email, e)
  }
}
