
export enum DocumentType {
  HEALTH_CERTIFICATE = 'Állatorvosi eü. igazolás',
  LAB_RESULTS = 'Labor lelet',
  VACCINATION = 'Oltási könyv',
  CONTRACT = 'Szerződés',
  SINGUP = 'Jelentkezési lap',
  EXAM = 'Vizsgajegyzőkönyv',
  TRACKING_SHEET = 'Utánkövetési lap',
  MATESZE_THERAPY_CERTIFICATES = 'MATESZE Terápiás Igazolvány',
  MATESZE_SERVICE_CERTIFICATES = 'MATESZE Segítő Igazolvány',
  ADI_THERAPY_CERTIFICATES = 'ADI Terápiás Igazolvány'
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

export class ExpiringDocument {
  prevDocument: DocumentEntry | null
  missingDocumentType: DocumentType
  expiryDate: Date | null
  dogId: string
}
