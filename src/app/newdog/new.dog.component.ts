import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'
import { filter, map, switchMap } from 'rxjs/operators'
import { asssistanceDogType, Dog, DogSex, dogSexArray } from 'src/domain/dog'

interface DogForm {
  name: string
  birthDate: moment.Moment
  breed: string
  dogSex: string
  assistanceType: string
  chipNumber: string
  owner: string
  address: string
  ownerPhone?: string
  ownerEmail?: string
}

@Component({
  styleUrls: ['./new.dog.component.scss'],
  templateUrl: './new.dog.component.html'
})
export class NewDogComponent implements OnInit {

  dogGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    birthDate: new FormControl(null, Validators.required),
    breed: new FormControl(null, Validators.required),
    dogSex: new FormControl(null, Validators.required),
    assistanceType: new FormControl(null, Validators.required),
    chipNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{15}$/)]),
    owner: new FormControl(null, Validators.required),
    address: new FormControl(null),
    ownerPhone: new FormControl(null),
    ownerEmail: new FormControl(null, Validators.email)
  })

  originalDogId: string | undefined
  originalDog: Dog | undefined
  dogSexs = dogSexArray
  assistanceTypes = asssistanceDogType

  title = 'Új kutya hozzáadása'
  maxDate = new Date()
  saveError = ''
  isSaving = false

  constructor(
    private storage: AngularFirestore,
    private auth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private router: Router,
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
        name: this.originalDog.name || '',
        birthDate: moment((this.originalDog.birthDate as firebase.firestore.Timestamp).toDate()),
        breed: this.originalDog.breed || '',
        dogSex: this.originalDog.dogSex || '',
        assistanceType: this.originalDog.assistanceType || '',
        chipNumber: this.originalDog.chipNumber || '',
        owner: this.originalDog.owner || '',
        address: this.originalDog.address || '',
        ownerPhone: this.originalDog.ownerPhone,
        ownerEmail: this.originalDog.ownerEmail
      } as DogForm)
    }
  }

  confirmResetDog() {
    if (confirm('Biztosan törli a módosításokat?')) {
      this.resetDog()
    }
  }

  async submit() {
    if (this.dogGroup.invalid) {
      return
    }
    this.isSaving = true

    const email = (await this.auth.currentUser).email
    const value = this.dogGroup.value as DogForm

    const dogSex = DogSex[value.dogSex]
    if (!dogSex) {
      throw { code: 0, message: `Nem létező kutya nem: ${value.dogSex} ` }
    }


    const newDog = {
      name: value.name,
      birthDate: value.birthDate.toDate(),
      breed: value.breed,
      dogSex: value.dogSex,
      assistanceType: value.assistanceType,
      chipNumber: value.chipNumber,
      owner: value.owner,
      address: value.address,
      ownerEmail: value.ownerEmail || null,
      ownerPhone: value.ownerPhone || null,
      createdAt: new Date(),
      createdBy: email
    } as Dog

    console.log('Saving new dog', newDog)
    try {
      if (this.originalDogId) {
        await this.storage.collection<Dog>('dogs').doc(this.originalDogId).set(newDog)
        this.snackBar.open('Sikeres frissítés', 'Ok')
      } else {
        await this.storage.collection<Dog>('dogs').add(newDog)
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

  async removeDog() {
    if (this.originalDogId && confirm('Biztos ki szeretné törölni a kutyát? A feltöltött dokumentumok megmaradnak a tárhelyen')) {
      this.isSaving = true
      try {
        await this.storage.collection('dogs').doc(this.originalDogId).delete()
        this.snackBar.open('Sikeres törlés', 'Ok', { duration: 2000 })
        this.router.navigate(['dog-list'])
      } catch (e) {
        console.error(e)
        this.snackBar.open('Sikertelen törlés', 'Ajaj')
      } finally {
        this.isSaving = false
      }
    }
  }
}
