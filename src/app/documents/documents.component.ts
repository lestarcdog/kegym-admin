import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from '@angular/fire/firestore'
import { QuerySnapshot } from '@angular/fire/firestore/interfaces'
import { AngularFireStorage } from '@angular/fire/storage'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import * as moment from 'moment'
import { throwError } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { DocumentEntry, DocumentType } from 'src/domain/document'

export interface DeleteEvent {
  isNewEvent: boolean
  newEventId?: number
  docId?: string
}

export interface UploadEvent {
  file: File
  date: moment.Moment
  type: DocumentType
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
  newDocuments: number[] = []


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

  addNewDocument() {
    this.newDocumentId += 1
    this.newDocuments.unshift(this.newDocumentId)
  }

  async upload(event: UploadEvent) {
    console.log('Uploading event', event)
  }

  async delete(event: DeleteEvent) {
    console.log('Delete event', event)
    if (event.isNewEvent) {
      this.newDocuments = this.newDocuments.filter(i => i !== event.newEventId)
    } else {
      console.log('Delete from storage')
    }
  }



}
