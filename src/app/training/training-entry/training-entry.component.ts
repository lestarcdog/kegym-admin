import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { TrainingType, trainingTypesArray } from 'src/domain/training';
import { TrainingEntryItem } from '../training.component';

interface EntryForm {
  date: moment.Moment
  type: TrainingType
  progress: number
  comment?: string
}

@Component({
  selector: 'app-training-entry',
  templateUrl: './training-entry.component.html',
  styleUrls: ['./training-entry.component.scss']
})
export class TrainingEntryComponent {

  entryGroup = new FormGroup({
    date: new FormControl(null, [Validators.required]),
    type: new FormControl(null, [Validators.required]),
    progress: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(100)]),
    comment: new FormControl(null)
  })

  maxDate = new Date()

  @Input()
  isSaving = false

  entry: TrainingEntryItem

  @Input('entry')
  set setEntry(i: TrainingEntryItem) {
    this.entry = i
    // it is not a dummy element for new item if has docId
    if (i.docId) {
      this.entryGroup.setValue({
        date: moment((i.date as any).toDate()),
        progress: i.progress,
        type: i.type,
        comment: i.comment
      } as EntryForm)
    }
  }

  @Output()
  save = new EventEmitter<TrainingEntryItem>()

  @Output()
  delete = new EventEmitter<string>()

  trainingTypes = trainingTypesArray

  constructor() { }

  submit() {
    console.log(this.entryGroup.value)

    if (this.entryGroup.valid) {
      const formValue = this.entryGroup.value as EntryForm
      this.save.emit({
        docId: this.entry.docId,
        date: formValue.date.toDate(),
        type: formValue.type,
        progress: formValue.progress,
        comment: formValue.comment || null
      } as TrainingEntryItem)
    }
  }

  deleteEntry() {
    if (this.entry.docId) {
      const date = ((this.entry?.date as any).toDate() as Date)?.toLocaleDateString()
      const type = TrainingType[this.entry.type]
      if (confirm(`Biztos benne hogy törli a ${date} - ${type} edzést`)) {
        this.delete.emit(this.entry.docId)
      }
    }
  }

}
