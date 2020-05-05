import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore'
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'
import { filter, map, switchMap } from 'rxjs/operators'
import { AssistanceDogType, asssistanceDogType, Dog, DogSex, dogSexArray, Trainer } from 'src/domain/dog'
import { mapFirebaseDog } from '../service/mapper/dogMapper'

interface DogForm {
  name: string
  birthDate: moment.Moment
  breed: string
  dogSex: string
  assistanceTypes: AssistanceDogType[]
  chipNumber: string
  trainer: Trainer
  owner: {
    name: string
    address: string
    phone?: string
    email?: string
  }
}

const notEmptyList: ValidatorFn = (c: AbstractControl): ValidationErrors => c.value?.length > 0 ? null : { invalid: 'Üres lista' }

@Component({
  styleUrls: ['./new-dog.component.scss'],
  templateUrl: './new-dog.component.html'
})
export class NewDogComponent implements OnInit {

  dogGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    birthDate: new FormControl(null, Validators.required),
    breed: new FormControl(null, Validators.required),
    dogSex: new FormControl(null, Validators.required),
    assistanceTypes: new FormControl([], [Validators.required, notEmptyList]),
    chipNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{15}$/)]),
    trainer: new FormControl(null, Validators.required),
    owner: new FormGroup({
      name: new FormControl(null, Validators.required),
      address: new FormControl(null),
      phone: new FormControl(null),
      email: new FormControl(null, Validators.email)
    })
  })

  singleAssistanceType = new FormControl(null)

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
        this.originalDog = mapFirebaseDog(dogDoc.data())
        this.resetDog()
      } else {
        console.log('Doc document not exists', dogDoc)
      }
    })

    this.singleAssistanceType.valueChanges.subscribe(v => {
      if (v) {
        const control = this.dogGroup.get('assistanceTypes')
        const prevValue = control.value as AssistanceDogType[]
        if (!prevValue.includes(v)) {
          control.setValue([v, ...prevValue])
        }
        this.singleAssistanceType.reset()
      }
    })
  }

  removeAssistanceTypeFromList(id: string) {
    const control = this.dogGroup.get('assistanceTypes')
    const prevValue = control.value as AssistanceDogType[]
    const filtered = prevValue.filter(i => i !== id)
    control.setValue(filtered)
  }


  getAssistanceTypeName(id: string) {
    return AssistanceDogType[id]
  }

  resetDog() {
    if (this.originalDog) {
      this.title = `Módosítás: ${this.originalDog.name}`
      this.dogGroup.setValue({
        name: this.originalDog.name || '',
        birthDate: moment(this.originalDog.birthDate),
        breed: this.originalDog.breed || '',
        dogSex: this.originalDog.dogSex || '',
        assistanceTypes: this.originalDog.assistanceTypes || [],
        chipNumber: this.originalDog.chipNumber || '',
        trainer: this.originalDog.trainer,
        owner: {
          name: this.originalDog.owner.name,
          address: this.originalDog.owner.address || '',
          phone: this.originalDog.owner.phone || '',
          email: this.originalDog.owner.email || '',
        }
      } as DogForm)
    }
  }

  confirmResetDog() {
    if (confirm('Biztosan törli a módosításokat?')) {
      this.resetDog()
    }
  }

  async submit() {
    console.log(this.dogGroup.value)

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
      assistanceTypes: value.assistanceTypes,
      chipNumber: value.chipNumber,
      owner: value.owner,
      trainer: value.trainer,
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
        this.snackBar.open('Sikeres mentés', 'Ok')
        this.router.navigate(['/dog-list'])
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
