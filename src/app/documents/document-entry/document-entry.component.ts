import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import * as moment from 'moment'
import { Observable } from 'rxjs'
import { documentTypesArray } from 'src/domain/document'
import { DeleteEvent, DocumentEntryItem, UploadEvent } from '../documents.component'


@Component({
  selector: 'app-document-entry',
  templateUrl: './document-entry.component.html',
  styleUrls: ['./document-entry.component.scss']
})
export class DocumentEntryComponent implements OnInit {

  constructor(
    private changeRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  documentTypes = documentTypesArray
  documentTypeSelect = new FormControl(null, Validators.required)
  documentDate = new FormControl(null, Validators.required)
  selectedFile: File

  @Output()
  delete = new EventEmitter<DeleteEvent>()

  @Output()
  upload = new EventEmitter<UploadEvent>()

  /**
   * Either new event id or the document is specified.
   */
  @Input()
  newEventId?: number

  /**
   * Input if existing document should be presented
   */
  document: DocumentEntryItem

  sanitizedDocumentUrl?: SafeUrl

  @Input('document')
  set setDocument(doc: DocumentEntryItem) {
    this.document = doc
    this.documentTypeSelect.setValue(doc.type)
    this.documentTypeSelect.disable()
    this.documentDate.setValue(moment(doc.documentDate))
    this.documentDate.disable()

    if (this.document?.downloadUrl) {
      this.sanitizedDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.document.downloadUrl)
    }
  }

  @Input()
  errorMessage?: string

  @Input()
  percentChange: Observable<number>

  ngOnInit(): void {
  }

  startUpload() {
    if (this.areFieldsValid()) {
      this.upload.emit({
        newDocId: this.newEventId,
        date: this.documentDate.value,
        file: this.selectedFile,
        type: this.documentTypeSelect.value
      })
    }
  }

  deleteDocument() {
    if (confirm(`Biztosan szeretné törölni a dokumentumot?`)) {
      if (this.document) {
        this.delete.emit({
          isNewDoc: false,
          doc: this.document
        })
      } else {
        this.delete.emit({
          isNewDoc: true,
          newDocId: this.newEventId
        })
      }
    }
  }

  get selectedFileSize(): string {
    if (this.selectedFile) {
      let size = this.selectedFile.size
      size = size / 1000
      if (size < 1000) {
        return `${size.toFixed(0)} KB`
      } else {
        const mbSize = (size / 1000).toFixed(0)
        return `${mbSize} MB`
      }
    } else {
      return ''
    }
  }

  areFieldsValid(): boolean {
    const fileSize = (this.selectedFile?.size / 1000 / 1000)
    if (fileSize >= 5) {
      this.errorMessage = 'Túl nagy fájlméret. Maximumum 5MB'
    }
    return this.documentTypeSelect.valid && this.selectedFile && this.documentDate.valid && fileSize < 5
  }

  fileSelected(fileList: FileList) {
    if (fileList.length > 0) {
      this.selectedFile = fileList[0]
      this.changeRef.detectChanges()
    }
  }

}
