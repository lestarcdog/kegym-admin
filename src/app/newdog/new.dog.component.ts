import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { filter, map, switchMap } from 'rxjs/operators';
import { Dog } from 'src/domain/dog';

@Component({
  styleUrls: ['./new.dog.component.scss'],
  templateUrl: './new.dog.component.html'
})
export class NewDogComponent implements OnInit {

  dogGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    birthDate: new FormControl(null, Validators.required),
    chipNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{15}$/)]),
    owner: new FormControl(null, Validators.required),
    address: new FormControl(null, Validators.required),
    ownerPhone: new FormControl(null),
    ownerEmail: new FormControl(null, Validators.email)
  })

  originalDogId: string | undefined
  originalDog: Dog | undefined

  title = 'Új kutya hozzáadása'
  maxDate = new Date()
  saveError = ''
  isSaving = false

  constructor(
    private storage: AngularFirestore,
    private auth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('dogId')),
      filter(x => !!x),
      switchMap(dogId => {
        return this.storage.collection<Dog>('dogs').doc<Dog>(dogId).get()
      })
    ).subscribe((dogDoc: DocumentSnapshot<Dog>) => {
      if (dogDoc.exists) {
        this.originalDogId = dogDoc.id
        this.originalDog = dogDoc.data()
        this.resetDog()
      } else {
        console.log('Doc document not exists', dogDoc)
      }
    })
  }

  resetDog() {
    if (this.originalDog) {
      this.title = `Módosítás: ${this.originalDog.name}`
      this.dogGroup.setValue({
        name: this.originalDog.name,
        birthDate: moment((this.originalDog.birthDate as firebase.firestore.Timestamp).toDate()),
        chipNumber: this.originalDog.chipNumber,
        owner: this.originalDog.owner,
        address: this.originalDog.address,
        ownerPhone: this.originalDog.ownerPhone,
        ownerEmail: this.originalDog.ownerEmail
      })
    }
  }

confirmResetDog() {
    if (confirm('Biztosan törli minden módosítást?')) {
      this.resetDog()
    }
  }

async submit() {
    if (this.dogGroup.invalid) {
      return
    }

    this.isSaving = true

    const email = (await this.auth.currentUser).email
    const value = this.dogGroup.value
    const newDog = new Dog(
      value.name,
      value.birthDate.toDate(),
      value.chipNumber,
      value.owner,
      value.address,
      new Date(),
      email,
      value.ownerPhone || null,
      value.ownerEmail || null
    )

    console.log('Saving new dog', newDog)
    try {
      if (this.originalDogId) {
        await this.storage.collection<Dog>('dogs').doc(this.originalDogId).set({ ...newDog })
        this.snackBar.open('Sikeres frissítés', 'Ok')
      } else {
        await this.storage.collection<Dog>('dogs').add({ ...newDog })
        this.dogGroup.reset({})
        this.snackBar.open('Sikeres mentés', 'Ok')
      }
    } catch (e) {
      console.error(e)
      this.saveError = `Sikertelen mentés: ${e.code} ${e.message}`
    } finally {
      this.isSaving = false
    }

  }
}
