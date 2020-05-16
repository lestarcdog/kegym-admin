import { Component, OnDestroy, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from '@angular/fire/firestore'
import { QuerySnapshot } from '@angular/fire/firestore/interfaces'
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage'
import { FormControl } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import moment from 'moment'
import { Observable, of, Subscription, throwError } from 'rxjs'
import { flatMap } from 'rxjs/operators'
import { DocumentEntry, DocumentType, documentTypesArray } from 'src/domain/document'

export interface DeleteEvent {
  isNewDoc: boolean
  newDocId?: number
  doc?: DocumentEntryItem
}

export interface UploadEvent {
  newDocId: number
  file: File
  date: moment.Moment
  type: DocumentType
}

interface NewDocument {
  newDocId: number
  errorMessage?: string
  percentChange?: Observable<number>
  uploadTask: AngularFireUploadTask
}

export interface DocumentEntryItem extends DocumentEntry {
  docId: string
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private store: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private snack: MatSnackBar
  ) { }

  private newDocumentId = 0

  documentTypeFilter = new FormControl(null)
  documentTypes = documentTypesArray
  private sub = new Subscription()

  dogId: string
  dogName = ''
  newDocuments: NewDocument[] = []

  allDocuments: DocumentEntryItem[] = []
  filteredDocuments: DocumentEntryItem[] = []


  ngOnInit(): void {
    this.route.paramMap.pipe(
      flatMap(param => {
        this.dogId = param.get('dogId')
        this.dogName = param.get('dogName')

        if (this.dogId) {
          return of(this.dogId)
        } else {
          return throwError('Nincs dokumentum id megadva')
        }
      })
    ).subscribe(() => this.refreshDocuments(), e => console.error(e))

    this.sub.add(this.documentTypeFilter.valueChanges.subscribe((key: DocumentType) => this.filterDocuments(key)))
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

  trackByItem(index: number, item: NewDocument) {
    return item.newDocId
  }

  addNewDocument() {
    this.newDocumentId += 1
    this.newDocuments = [
      { newDocId: this.newDocumentId, errorMessage: undefined, percentChange: undefined, uploadTask: undefined },
      ...this.newDocuments
    ]
  }

  private filterDocuments(typeKey: DocumentType) {
    if (typeKey) {
      this.filteredDocuments = this.allDocuments.filter(d => d.type === typeKey)
    } else {
      this.filteredDocuments = this.allDocuments
    }
  }

  private refreshDocuments() {
    this.store.collection('dogs').doc(this.dogId).collection('documents', r => r.orderBy('documentDate', 'desc')).get()
      .subscribe((data: QuerySnapshot<DocumentEntry>) => {
        this.allDocuments = data.docs.map(d => {
          const docData = d.data()
          return {
            docId: d.id,
            downloadUrl: docData.downloadUrl,
            type: docData.type,
            fileType: docData.fileType || 'application/pdf',
            createdBy: docData.createdBy,
            createdAt: (docData.createdAt as any).toDate(),
            documentDate: (docData.documentDate as any).toDate(),
          }
        })

        this.filterDocuments(this.documentTypeFilter.value)
      })
  }

  private getDocumentName(date: moment.Moment, type: DocumentType, filename: string) {
    const datePart = date.format('YYYY_MM_DD')
    const ext = filename.split('.').pop()
    return `${datePart}_${type}.${ext}`
  }

  private getDocumentFirebaseDoc(docId: string) {
    return this.store.collection('dogs').doc(this.dogId).collection('documents').doc<DocumentEntry>(docId)
  }

  private getDocumentStorageRef(docId: string) {
    return this.storage.ref(`dogs/${this.dogId}/documents/${docId}`)
  }

  async upload(event: UploadEvent) {
    if (this.dogId) {
      const docId = this.getDocumentName(event.date, event.type, event.file.name)
      const docRef = this.getDocumentFirebaseDoc(docId)
      const doc = await docRef.get().toPromise()
      if (doc.exists) {
        const errorMessage = `A ${event.date.format('YYYY.MM.DD')} dátummal már van dokumentum feltöltve a '${DocumentType[event.type]}' típushoz.
        Törölje az előző dokumentumot ha újat szeretne feltölteni ezekkel a paraméterekkel.`
        this.syncNewDocuments(event.newDocId, { errorMessage })
        return
      }

      const storageRef = this.getDocumentStorageRef(docId)
      const uploadTask = storageRef.put(event.file)
      this.syncNewDocuments(event.newDocId, { percentChange: uploadTask.percentageChanges(), uploadTask, errorMessage: undefined })

      try {
        await uploadTask.then()
        const downloadUrl = await storageRef.getDownloadURL().toPromise()
        docRef.set({
          documentDate: event.date.toDate(),
          downloadUrl,
          fileType: event.file.type,
          type: event.type,
          createdAt: new Date(),
          createdBy: (await this.auth.currentUser).email
        })
        this.newDocuments = this.newDocuments.filter(d => d.newDocId !== event.newDocId)
        this.refreshDocuments()
      } catch (e) {
        if (e.code === 'storage/canceled') {
          console.log('User cancelled upload')
          this.filterOutNewDoc(event.newDocId)
          this.snack.open(`Feltöltés megszakítva ${event.date.format('YYYY.MM.DD')} - ${DocumentType[event.type]}`,
            'Ok',
            { duration: 5000 }
          )
        } else {
          console.error('Upload failed', e)
          this.syncNewDocuments(event.newDocId, { errorMessage: 'Nem sikerült a feltöltés valami miatt.' })
        }
      }
    }
  }

  private filterOutNewDoc(newDocId: number) {
    this.newDocuments = this.newDocuments.filter(d => d.newDocId !== newDocId)
  }

  private syncNewDocuments(newDocId: number, newDoc: Partial<NewDocument>) {
    // do the maneuver to make change detection work
    const updatedDocs = [...this.newDocuments]
    const spliceIdx = this.newDocuments.findIndex(d => d.newDocId === newDocId)
    const prevDoc = this.newDocuments[spliceIdx]
    updatedDocs.splice(spliceIdx, 1, { ...prevDoc, ...newDoc })
    this.newDocuments = updatedDocs
  }

  async delete(event: DeleteEvent) {
    console.log('Delete event', event)
    if (event.isNewDoc) {
      this.newDocuments = this.newDocuments.filter(i => {
        if (i.uploadTask?.cancel()) {
          console.log(i, 'task cancelled')
        }
        return i.newDocId !== event.newDocId
      })
    } else {
      const { doc } = event
      const storageRef = this.getDocumentStorageRef(doc.docId)
      const storeRef = this.getDocumentFirebaseDoc(doc.docId)

      try {
        await storageRef.delete().toPromise()
        await storeRef.delete()
        this.refreshDocuments()
        this.snack.open('Dokumentum sikeresen törölve', 'Ok', { duration: 2000 })
      } catch (e) {
        console.error(e)
        this.snack.open('Valami baj történt a dokumentum törlése közben', 'Ajaj')
      }
    }
  }



}
