import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TrainersService } from 'src/app/service/trainer.service';
import { Trainer } from 'src/domain/dog';

@Component({
  selector: 'app-trainer-select',
  templateUrl: './trainer-select.component.html',
  styleUrls: ['./trainer-select.component.scss']
})
export class TrainerSelectComponent implements OnInit {

  @Input()
  controlName: string

  @Input()
  parentFormGroup: FormGroup

  filteredTrainers: Observable<Trainer[]>

  constructor(private trainerService: TrainersService) { }


  ngOnInit(): void {
    const filterKey = this.parentFormGroup.get(this.controlName).valueChanges as Observable<string>
    const initialFilterKey = filterKey.pipe(startWith(''))
    this.filteredTrainers = combineLatest([this.trainerService.trainers, initialFilterKey])
      .pipe(
        map(([trainer, key]) => {
          if (key) {
            return trainer.filter(t => t.name.toLocaleLowerCase().includes(key))
          } else {
            return trainer
          }
        })
      )
  }

  displayTrainerName(t: Trainer) {
    return t?.name
  }

}
