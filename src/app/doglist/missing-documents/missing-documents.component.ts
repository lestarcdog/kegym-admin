import { Component, Input, OnInit } from '@angular/core'
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore'
import { firebaseToDate } from 'src/app/service/time-util'
import { DocumentType, ExpiringDocument } from 'src/domain/document'
import { ListDog } from '../dog-list.component'

class GroupedExpiringDocument {
  dogId: string
  docs: ExpiringDocument[]
}

@Component({
  selector: 'app-missing-documents',
  templateUrl: './missing-documents.component.html',
  styleUrls: ['./missing-documents.component.scss']
})
export class MissingDocumentsComponent implements OnInit {


  @Input()
  dogs: ListDog[] = []

  constructor(
    private store: AngularFirestore
  ) { }

  expiringDocuments: GroupedExpiringDocument[] = []

  async ngOnInit() {
    this.store.collection('expiring-documents').get()
      .subscribe((snapshot: QuerySnapshot<ExpiringDocument>) => {
        const allExpDocs = snapshot.docs.map(d => {
          const data = d.data()
          return {
            ...data,
            expiryDate: firebaseToDate(data.expiryDate)
          }
        })

        const grouped = new Map<string, ExpiringDocument[]>()
        allExpDocs.forEach(d => {
          const id = d.dogId
          if (grouped.has(id)) {
            // ascending order by expiry date. sooner expires more to the top
            const newArr = [...grouped.get(id), d].sort((a, b) => (a.expiryDate?.valueOf() || 0) - (b.expiryDate?.valueOf() || 0))
            grouped.set(id, newArr)
          } else {
            grouped.set(id, [d])
          }
        })

        const vs: GroupedExpiringDocument[] = []
        grouped.forEach((docs, dogId) => vs.push({ dogId, docs }))
        this.expiringDocuments = vs
      })
  }

  getDocName(id: string): string {
    return DocumentType[id]
  }


  getDogName(id: string): string {
    return this.dogs.find(d => d.docId === id)?.name
  }

  getDogHandlerDetails(id: string): string {
    const d = this.dogs.find(d => d.docId === id)
    return d ? `${d.owner.name} (${d.owner.email})` : ''
  }

}
