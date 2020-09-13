import { Component, OnDestroy, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from '@angular/fire/firestore'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Subscription } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { hunPhoneNumberValidator } from 'src/app/service/phone-number-validator'
import { firebaseToMomentDate } from 'src/app/service/time-util'
import { Trainer } from 'src/domain/dog'

@Component({
  templateUrl: './trainers-settings.component.html',
  styleUrls: ['./trainers-settings.component.scss']
})
export class TrainersSettingsComponent implements OnInit, OnDestroy {

  trainersForm: FormGroup[] = []
  visibleTrainers: FormGroup[] = []

  searchControl: FormControl = new FormControl()

  private sub = new Subscription()

  constructor(
    private store: AngularFirestore,
    private auth: AngularFireAuth,
    private snack: MatSnackBar
  ) { }


  async ngOnInit() {
    const ts = await this.store.collection<Trainer>('trainers', q => q.orderBy('name')).get().toPromise()

    ts.docs.forEach(doc => {
      const t = doc.data() as Trainer
      this.trainersForm.push(this.createTrainerFormGroup(t))
      this.visibleTrainers = this.trainersForm
    })

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((key: string) => {
      if (key) {
        const small = key.toLocaleLowerCase()
        this.visibleTrainers = this.trainersForm.filter(f => (f.value.name as string).toLocaleLowerCase().includes(small))
      } else {
        this.visibleTrainers = this.trainersForm
      }
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

  private createTrainerFormGroup(t?: Trainer): FormGroup {
    return new FormGroup({
      trainerId: new FormControl(t?.trainerId),
      name: new FormControl(t?.name, Validators.required),
      email: new FormControl(t?.email, [Validators.email, Validators.required]),
      phone: new FormControl(t?.phone, hunPhoneNumberValidator),
      createdAt: new FormControl(firebaseToMomentDate(t?.createdAt)),
      createdBy: new FormControl(t?.createdBy),
    })
  }

  addNewEmptyTrainer() {
    this.trainersForm.unshift(this.createTrainerFormGroup())
  }


  async save(trainerData: FormGroup) {
    if (trainerData.valid) {
      const createdAt = new Date()
      const data = trainerData.value
      const trainerId = data.trainerId || `${data.email}${new Date().getTime()}`
      const doc = this.store.collection<Trainer>('trainers').doc(trainerId)
      const createdBy = (await this.auth.currentUser).email
      try {
        await doc.set({
          trainerId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          createdAt,
          createdBy
        })
        this.snack.open(`${data.name} sikeresen mentve`, 'Oké', { duration: 2000 })

        trainerData.patchValue({
          trainerId,
          createdAt,
          createdBy
        })

      } catch (e) {
        console.error(e)
        this.snack.open(`${data.name} nem sikerült elmenteni`, 'Ajaj')
      }

    }
  }

  async delete(trainer: FormGroup) {
    const { trainerId, name } = trainer.value
    if (trainerId) {
      console.log('Deleting trainer with id', trainerId)
      if (confirm(`Biztos ki akarja törölni: ${name}`)) {
        try {
          await this.store.collection<Trainer>('trainers').doc(trainerId).delete()
          this.snack.open('Sikeres törlés', 'Ok', { duration: 2000 })
          this.trainersForm = this.trainersForm.filter(f => f.value.trainerId !== trainerId)
          this.visibleTrainers = this.trainersForm
          this.searchControl.reset()
        } catch (e) {
          console.error('Failed to delete', e)
          this.snack.open('Nem sikerült a törlés', 'Mé nem?')
        }
      }
    }
  }

}
