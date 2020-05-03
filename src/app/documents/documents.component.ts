import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from '@angular/fire/firestore'
import { QuerySnapshot } from '@angular/fire/firestore/interfaces'
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import * as moment from 'moment'
import { throwError } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { DocumentEntry, DocumentType } from 'src/domain/document'

export interface DeleteEvent {
  isNewDoc: boolean
  newDocId?: number
  docId?: string
}

export interface UploadEvent {
  newDocId: number
  file: File
  date: moment.Moment
  type: DocumentType
}

interface NewDocument {
  newDocId: number
  errorMessage: string
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
export class DocumentsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private store: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private snack: MatSnackBar
  ) { }

  private newDocumentId = 0

  dogId: string
  dogName = ''
  newDocuments: NewDocument[] = []


  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(param => {
        this.dogId = param.get('dogId')
        this.dogName = param.get('dogName')

        if (this.dogId) {
          return this.store.collection('dogs').doc(this.dogId).collection('documents', r => r.orderBy('documentDate')).get()
        } else {
          return throwError('Nincs dokumentum id megadva')
        }
      })
    ).subscribe((data: QuerySnapshot<DocumentEntry>) => {

    })
  }

  trackByItem(index: number, item: NewDocument) {
    return item.newDocId
  }

  addNewDocument() {
    this.newDocumentId += 1
    this.newDocuments = [{ newDocId: this.newDocumentId, errorMessage: undefined, uploadTask: undefined }, ...this.newDocuments]
  }

  private getDocumentId(evt: UploadEvent) {
    const datePart = evt.date.format('YYYY_MM_DD')
    return `${datePart}_${evt.type}`
  }

  private getDocumentFirebaseDoc(docId: string) {
    return this.store.collection('dogs').doc(this.dogId).collection('documents').doc<DocumentEntry>(docId)
  }

  async upload(event: UploadEvent) {
    if (this.dogId) {
      const docId = this.getDocumentId(event)
      console.log('event', event, 'docit', docId)
      const docRef = this.getDocumentFirebaseDoc(docId)
      const doc = await docRef.get().toPromise()
      if (doc.exists) {
        const errorMessage = `A ${event.date.format('YYYY.MM.DD')} dátummal már van dokumentum feltöltve a '${DocumentType[event.type]}' típushoz.
        Törölje az előző dokumentumot ha újat szeretne feltölteni ezekkel a paraméterekkel.`
        this.syncNewDocuments(event.newDocId, { errorMessage })
        return
      }

      const storageRef = this.storage.ref(`dogs/${this.dogId}/documents/${docId}`)
      const uploadTask = storageRef.put(event.file)
      this.syncNewDocuments(event.newDocId, { uploadTask, errorMessage: undefined })

      try {
        await uploadTask.then()
        const downloadUrl = await storageRef.getDownloadURL().toPromise()
        docRef.set({
          documentDate: event.date.toDate(),
          downloadUrl,
          type: event.type,
          createdAt: new Date(),
          createdBy: (await this.auth.currentUser).email
        })
        this.newDocuments = this.newDocuments.filter(d => d.newDocId !== event.newDocId)
      } catch (e) {
        console.error('Upload failed', e)
        this.syncNewDocuments(event.newDocId, { errorMessage: 'Nem sikerült a feltöltés valami miatt.' })
      }


    }
  }

  private syncNewDocuments(newDocId: number, newDoc: Partial<NewDocument>) {
    // do the manevour to make change detection work
    const updatedDocs = [...this.newDocuments]
    const spliceIdx = this.newDocuments.findIndex(d => d.newDocId === newDocId)
    const prevDoc = this.newDocuments[spliceIdx]
    updatedDocs.splice(spliceIdx, 1, { ...prevDoc, ...newDoc })
    console.log('Old docs', this.newDocuments, 'new docs', updatedDocs)
    this.newDocuments = updatedDocs
  }

  async delete(event: DeleteEvent) {
    console.log('Delete event', event)
    if (event.isNewDoc) {
      this.newDocuments = this.newDocuments.filter(i => i.newDocId !== event.newDocId)
    } else {
      console.log('Delete from storage')
    }
  }



}
