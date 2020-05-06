import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MedicineEntryItem, NewMedicineEvent } from '../provision.component';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  styleUrls: ['../sub-panel.scss']
})
export class MedicineComponent {

  @Input()
  medicines: MedicineEntryItem[]

  @Output()
  delete = new EventEmitter<string>()

  @Output()
  save = new EventEmitter<NewMedicineEvent>()

  medicineForm = new FormGroup({
    date: new FormControl(null, Validators.required),
    medicine: new FormControl(null, Validators.required),
    comment: new FormControl(null)
  })

  showMedicineForm = false


  addNewMedicine() {
    if (!this.showMedicineForm) {
      this.showMedicineForm = true
      this.medicineForm.reset()
    }
  }

  clearNewFood() {
    this.showMedicineForm = false
  }

  removeMedicine(docId: string) {
    if (confirm('Biztos szeretné törölni ezt az gyógyszert?')) {
      this.delete.emit(docId)
    }
  }

  saveMedicine() {
    if (this.medicineForm.valid) {
      const data = this.medicineForm.value
      this.save.emit({
        date: data.date.toDate(),
        medicine: data.medicine,
        comment: data.comment
      })
      this.clearNewFood()
    }
  }

}
