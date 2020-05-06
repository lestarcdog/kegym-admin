
export enum DocumentType {
  HEALTH_CERTIFICATE = 'Állatorvosi eü. igazolás',
  LAB_RESULTS = 'Labor lelet',
  VACCINATION = 'Oltási könyv',
  CONTRACT = 'Szerződés',
  SINGUP = 'Jelentkezési lap',
  EXAM = 'Vizsgajegyzőkönyv',
  TRACKING_SHEET = 'Utánkövetési lapok',
  CERTIFICATES = 'Igazolványok',
  RENEWAL_PROCESS = 'Meghosszabítás'
}

export const documentTypesArray = Object.keys(DocumentType).map((key) => ({ key, value: DocumentType[key] }))

export class DocumentEntry {
  type: DocumentType
  downloadUrl: string
  fileType: string
  documentDate: Date
  createdAt: Date
  createdBy: string
}
