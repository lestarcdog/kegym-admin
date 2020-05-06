import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FoodEntryItem, NewFoodEvent } from '../provision.component';

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.scss']
})
export class FoodComponent implements OnInit {

  @Input()
  foods: FoodEntryItem[]

  @Output()
  delete = new EventEmitter<string>()

  @Output()
  save = new EventEmitter<NewFoodEvent>()

  foodForm = new FormGroup({
    date: new FormControl(null, Validators.required),
    foodName: new FormControl(null, Validators.required),
    foodPortion: new FormControl(null, [Validators.min(0)]),
    dogWeight: new FormControl(null, [Validators.min(0), Validators.max(100)]),
    comment: new FormControl(null)
  })

  showFoodForm = false

  constructor() { }

  ngOnInit(): void {
  }

  addNewFood() {
    if (!this.showFoodForm) {
      this.showFoodForm = true
      this.foodForm.reset()
    }
  }

  clearNewFood() {
    this.showFoodForm = false
  }

  removeFood(docId: string) {
    if  (confirm('Biztos szeretné törölni ezt az étrendet?')) {
      this.delete.emit(docId)
    }
  }

  saveFood() {
    if (this.foodForm.valid) {
      const data = this.foodForm.value
      console.log('form data', data)
      this.save.emit({
        date: data.date.toDate(),
        dogWeight: data.dogWeight,
        foodName: data.foodName,
        foodPortion: data.foodPortion,
        comment: data.comment
      })
      this.clearNewFood()
    }
  }

}
