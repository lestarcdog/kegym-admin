import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Dog } from 'src/domain/dog';

@Component({
  styleUrls: ['./new.dog.component.scss'],
  templateUrl: './new.dog.component.html'
})
export class NewDogComponent {

  dogGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    birthDate: new FormControl(null, Validators.required),
    chipNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{15}$/)]),
    owner: new FormControl(null, Validators.required),
    address: new FormControl(null, Validators.required),
    ownerPhone: new FormControl(null),
    ownerEmail: new FormControl(null, Validators.email)
  })

  maxDate = new Date()
  saveError = ''
  isSaving = false

  constructor(
    private storage: AngularFirestore,
    private auth: AngularFireAuth,
    private snackBar: MatSnackBar) { }

  async submit() {
    if (this.dogGroup.invalid) {
      return
    }

    this.isSaving = true

    const uid = (await this.auth.currentUser).uid
    const value = this.dogGroup.value
    const newDog = new Dog(
      value.name,
      value.birthDate.toDate(),
      value.chipNumber,
      value.owner,
      value.address,
      new Date(),
      uid,
      value.ownerPhone || null,
      value.ownerEmail || null
    )

    console.log('Saving new dog', newDog)
    try {
      await this.storage.collection<Dog>('dogs').add({ ...newDog })
      this.snackBar.open('Sikeres mentés', 'Ok')
    } catch (e) {
      console.error(e)
      this.saveError = `Sikertelen mentés: ${e.code} ${e.message}`
    } finally {
      this.isSaving = false
    }

  }
}
