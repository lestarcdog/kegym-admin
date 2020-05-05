import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { TrainingMilestone, trianingPlaceArray } from 'src/domain/dog';

@Component({
  selector: 'app-training-milestones',
  templateUrl: './training-milestones.component.html',
  styleUrls: ['./training-milestones.component.scss']
})
export class TrainingMilestonesComponent implements OnInit {

  trainingStartForm = new FormGroup({
    trainingStartDate: new FormControl(null, Validators.required),
    trainingPlace: new FormControl(null, Validators.required)
  })

  handoverForm = new FormGroup({
    handoverDate: new FormControl(null, Validators.required)
  })

  examForm = new FormGroup({
    examDate: new FormControl(null, Validators.required)
  })

  trainingPlaces = trianingPlaceArray

  @Input()
  set trainingMilestone(milestone: TrainingMilestone) {
    if (milestone) {
      this.trainingStartForm.setValue({
        trainingStartDate: (milestone.trainingStartDate as any)?.toDate(),
        trainingPlace: milestone.trainingPlace
      })
    }
  }

  calcDateDiffNow(form: FormGroup, dateFieldName: string): string {
    const date = form.get(dateFieldName).value as moment.Moment
    if (date) {
      const now = moment()
      const daysDiff = date.diff(now, 'days')
      if (daysDiff === 0) {
        return ': Ma'
      } else if (daysDiff < 0) {
        return `: eltelt ${daysDiff * -1} nap`
      } else {
        return `: ${daysDiff} nap múlva`
      }
    } else {
      return ''
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
