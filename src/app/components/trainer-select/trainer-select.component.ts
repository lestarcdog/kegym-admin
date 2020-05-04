import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { TrainersService } from 'src/app/service/trainer.service';
import { Trainer } from 'src/domain/dog';

@Component({
  selector: 'app-trainer-select',
  templateUrl: './trainer-select.component.html',
  styleUrls: ['./trainer-select.component.scss']
})
export class TrainerSelectComponent {

  @Input()
  controlName: string

  @Input()
  parentFormGroup: FormGroup

  constructor(private trainerService: TrainersService) { }

  compareTrainer(t1: Trainer, t2: Trainer) {
    return t1?.trainerId === t2?.trainerId
  }

  get trainers(): Observable<Trainer[]> {
    return this.trainerService.trainers
  }

}
