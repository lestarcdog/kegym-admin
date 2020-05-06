import { Component, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { firebaseToMomentDate } from 'src/app/service/time-util';
import { AssistanceDogType, Dog, TrainingMilestone, trianingPlaceArray } from 'src/domain/dog';
import { milestoneTimeDifference } from '../milestone-time-diff';

@Component({
  selector: 'app-training-milestones',
  templateUrl: './training-milestones.component.html',
  styleUrls: ['./training-milestones.component.scss']
})
export class TrainingMilestonesComponent {

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
  // if the 3 steps are completed
  completedSteps: boolean[] = [false, false, false]
  selectedStepIndex = 0

  @Input()
  dogId: string

  @Input()
  assistanceType: AssistanceDogType

  @Input()
  set milestone(ms: TrainingMilestone) {
    if (ms) {
      this.trainingStartForm.patchValue({
        trainingStartDate: firebaseToMomentDate(ms.trainingStartDate),
        trainingPlace: ms.trainingPlace
      })

      this.handoverForm.patchValue({
        handoverDate: firebaseToMomentDate(ms.handoverDate)
      })

      this.examForm.patchValue({
        examDate: firebaseToMomentDate(ms.examDate)
      })

      // move to the last unfilled form
      if (ms.examDate) {
        this.selectedStepIndex = 2
        this.completedSteps = [true, true, true]
      } else if (ms.handoverDate) {
        this.selectedStepIndex = 2
        this.completedSteps = [true, true, false]
      } else if (ms.trainingPlace && ms.trainingStartDate) {
        this.selectedStepIndex = 1
        this.completedSteps = [true, false, false]
      } else {
        this.selectedStepIndex = 0
        this.completedSteps = [false, false, false]
      }
      console.log(this.selectedStepIndex, ms)
    }
  }

  constructor(
    private store: AngularFirestore,
    private snack: MatSnackBar,
    private auth: AngularFireAuth
  ) { }

  calcDateDiffNow(form: FormGroup, dateFieldName: string): string {
    const date = form.get(dateFieldName).value as moment.Moment
    return milestoneTimeDifference(date)
  }

  async updateTrainingStart() {
    if (this.trainingStartForm.valid) {
      const data = this.trainingStartForm.value
      this.updateStore({
        trainingStartDate: (data.trainingStartDate).toDate(),
        trainingPlace: data.trainingPlace,
      }, 'Kiképzés kezdete')
    }
  }

  async updateHandover() {
    if (this.handoverForm.valid) {
      await this.updateStore({
        handoverDate: this.handoverForm.value.handoverDate.toDate(),
      }, 'Átadás')
    }
  }

  async updateExam() {
    if (this.examForm.valid) {
      const data = this.examForm.value
      this.updateStore({
        examDate: data.examDate.toDate()
      }, 'Vizsga')
    }
  }

  private async updateStore(data: any, formName: string) {
    const ref = this.getDogReference()
    const createdBy = (await this.auth.currentUser).email
    try {
      await ref.set({
        trainingMileStones: {
          [this.assistanceType]: {
            ...data,
            createdAt: new Date(),
            createdBy
          }
        }
      }, { merge: true })
      this.snack.open(`${formName} frissítve`, 'Ok', { duration: 2000 })
    } catch (e) {
      console.error(e)
      this.snack.open(`Nem sikerült frissíteni a(z) ${formName}`, 'Mé nem?')
    }
  }

  private getDogReference() {
    return this.store.collection('dogs').doc<Partial<Dog>>(this.dogId)
  }

}
