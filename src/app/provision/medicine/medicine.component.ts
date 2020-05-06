import { Component, Input, OnInit } from '@angular/core';
import { MedicineEntryItem } from '../provision.component';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  styleUrls: ['./medicine.component.scss']
})
export class MedicineComponent implements OnInit {

  @Input()
  medicines: MedicineEntryItem[]

  constructor() { }

  ngOnInit(): void {
  }

}
