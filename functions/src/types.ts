import { ExpiringDocument } from "../../src/domain/document"
import { Dog } from "../../src/domain/dog"

export interface ExpiringData {
  document: ExpiringDocument
  dog: Dog
}
