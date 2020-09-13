import * as functions from 'firebase-functions'
import * as nodemailer from 'nodemailer'
import { DocumentEntry } from '../../src/domain/document'
import { Dog } from '../../src/domain/dog'

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

//@ts-ignore
async function sendWelcomeEmail(doc: DocumentEntry, dog: Dog ) {
  const email = ''
  const mailOptions: nodemailer.SendMailOptions = {
    from: `Kutyaval egy mosolyért <kutyavalegymosolyert@gmail.com>`,
    to: email,
    cc: ['juharosagota@gmail.com', 'kutyaslany.dia@gmail.com']
  };

  // The user subscribed to the newsletter.
  // mailOptions.subject = `Welcome to ${APP_NAME}!`;
  // mailOptions.html = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
  await mailTransport.sendMail(mailOptions);
  console.log('New welcome email sent to:', email);
  return null;
}
