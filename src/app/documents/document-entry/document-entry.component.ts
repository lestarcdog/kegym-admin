import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
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
  uploadPercent: Observable<number>

  ngOnInit(): void {
  }

  startUpload() {
    if (this.areFieldsValid()) {
      this.upload.emit({
        date: this.documentDate.value,
        file: this.selectedFile,
        type: this.documentTypeSelect.value
      })
    }
  }

  deleteDocument() {
    if (this.document) {
      this.delete.emit({
        isNewEvent: false,
        docId: this.document.docId
      })
    } else {
      this.delete.emit({
        isNewEvent: true,
        newEventId: this.newEventId
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
