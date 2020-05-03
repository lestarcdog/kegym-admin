import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { AngularFireUploadTask } from '@angular/fire/storage/task'
import { FormControl, Validators } from '@angular/forms'
import { documentTypesArray } from 'src/domain/document'
import { DeleteEvent, DocumentEntryItem, UploadEvent } from '../documents.component'


@Component({
  selector: 'app-document-entry',
  templateUrl: './document-entry.component.html',
  styleUrls: ['./document-entry.component.scss']
})
export class DocumentEntryComponent implements OnInit {

  constructor(
    private changeRef: ChangeDetectorRef
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
  newEventId: number

  /**
   * Input if existing document should be presented
   */
  @Input()
  document: DocumentEntryItem

  @Input()
  errorMessage: string

  @Input()
  uploadTask: AngularFireUploadTask

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
    if (this.document) {
      this.delete.emit({
        isNewDoc: false,
        docId: this.document.docId
      })
    } else {
      this.delete.emit({
        isNewDoc: true,
        newDocId: this.newEventId
      })
    }
  }

  get selectedFileSize(): string {
    if (this.selectedFile) {
      let size = this.selectedFile.size
      size = size / 1000
      if (size < 1000) {
        return `${size.toFixed(0)} KB`
      } else {
        return ` ${(size / 1000).toFixed(0)} MB`
      }
    } else {
      return ''
    }
  }

  areFieldsValid(): boolean {
    return this.documentTypeSelect.valid && this.selectedFile && this.documentDate.valid
  }

  fileSelected(fileList: FileList) {
    if (fileList.length > 0) {
      this.selectedFile = fileList[0]
      this.changeRef.detectChanges()
    }
  }

}
