import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { firebaseToDate } from 'src/app/service/time-util'
import { TrainingType } from 'src/domain/training'

@Component({
  templateUrl: './training-type.component.html',
  styleUrls: ['./training-type.component.scss']
})
export class TrainingTypeComponent implements OnInit {

  constructor(
    private store: AngularFirestore,
    private auth: AngularFireAuth,
    private snack: MatSnackBar
  ) { }

  trainingTypes: TrainingType[] = []

  newType = new FormGroup({
    hu: new FormControl(null, [Validators.required]),
    en: new FormControl(null)
  })

  ngOnInit(): void {
    this.refresh()
  }

  private refresh() {
    this.clearForm()
    this.store.collection('training-types', ref => ref.orderBy('hu')).get()
      .subscribe((snap: QuerySnapshot<TrainingType>) => {
        this.trainingTypes = snap.docs
          .map(d => {
            const data = d.data()
            return {
              ...data,
              id: d.id,
              createdAt: firebaseToDate(data.createdAt),
              deleted: firebaseToDate(data.deleted)
            } as TrainingType
          })
          .filter(d => d.deleted == null)
      })
  }

  clearForm() {
    this.newType.reset()
  }

  async save() {
    if (this.newType.valid) {
      const value = this.newType.value
      try {
        const createdBy = (await this.auth.currentUser).email
        await this.store.collection<TrainingType>('training-types').add({
          hu: value.hu,
          en: value.en || null,
          createdAt: new Date(),
          createdBy
        })
        this.snack.open(`Sikeres mentés ${value.hu}`, 'Rendben', { duration: 2000 })
        this.refresh()
      } catch (e) {
        console.error(e)
        this.snack.open('Nem sikerült a mentés', 'Az baj')
      }
    }
  }

  async delete(training: TrainingType) {
    if (training.id && confirm(`Biztos törölni szeretné a '${training.hu}' gyakorlatot?`)) {
      try {
        await this.store.collection<TrainingType>('training-types').doc(training.id).update({
          deleted: new Date()
        } as Partial<TrainingType>)
        this.snack.open('Gyakorlat törölve', 'Ok', { duration: 2000 })
        this.refresh()
      } catch (e) {
        console.error(e)
        this.snack.open(`Nem sikerült a gyakorlat törlése`, 'Francba')
      }
    }
  }

}
