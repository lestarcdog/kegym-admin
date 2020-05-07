import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { QueryDocumentSnapshot } from '@angular/fire/firestore/interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { FoodEntry, MedicineEntry } from 'src/domain/provision';
import { firebaseToDate } from '../service/time-util';


const FOOD_COLLECTION = 'food'
const MEDICINE_COLLECTION = 'medicine'

export interface FoodEntryItem extends FoodEntry {
  docId: string
}

export interface MedicineEntryItem extends MedicineEntry {
  docId: string
}

export interface NewFoodEvent {
  date: Date
  foodName: string
  foodPortion: number
  dogWeight: number
  comment?: string
}

export interface NewMedicineEvent {
  date: Date
  medicine: string
  comment: string
}

@Component({
  selector: 'app-provision',
  templateUrl: './provision.component.html',
  styleUrls: ['./provision.component.scss']
})
export class ProvisionComponent implements OnInit {

  constructor(
    private auth: AngularFireAuth,
    private store: AngularFirestore,
    private snack: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  dogId: string
  dogName: string

  foods: FoodEntryItem[]
  medicines: MedicineEntryItem[]

  selectedTabIdx = 0

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => {
        this.dogId = params.get('dogId')
        this.dogName = params.get('dogName')
        return this.dogId
      })
    ).subscribe(() => {
      this.refreshFoods()
      this.refreshMedicine()
    })
  }

  private async refreshFoods() {
    const food = await this.store.collection('dogs').doc(this.dogId)
      .collection(FOOD_COLLECTION, r => r.orderBy('date', 'desc'))
      .get().toPromise()
    this.foods = food.docs.map((d: QueryDocumentSnapshot<FoodEntry>) => {
      const data = d.data()
      return {
        docId: d.id,
        date: firebaseToDate(data.date),
        dogWeight: data.dogWeight,
        foodName: data.foodName,
        foodPortion: data.foodPortion,
        comment: data.comment,
        createdAt: firebaseToDate(data.createdAt),
        createdBy: data.createdBy
      }
    })
  }

  private async refreshMedicine() {
    const food = await this.store.collection('dogs').doc(this.dogId)
      .collection(MEDICINE_COLLECTION, r => r.orderBy('date', 'desc'))
      .get().toPromise()
    this.medicines = food.docs.map((d: QueryDocumentSnapshot<MedicineEntry>) => {
      const data = d.data()
      return {
        docId: d.id,
        date: firebaseToDate(data.date),
        medicine: data.medicine,
        comment: data.comment,
        createdAt: firebaseToDate(data.createdAt),
        createdBy: data.createdBy
      }
    })
  }

  async newFoodEvent(event: NewFoodEvent) {
    console.log('food event', event)
    await this.saveEvent<FoodEntry>({
      date: event.date,
      dogWeight: event.dogWeight,
      foodName: event.foodName,
      foodPortion: event.foodPortion,
      comment: event.comment || null
    }, FOOD_COLLECTION)
    this.refreshFoods()

  }

  async newMedicineEvent(event: NewMedicineEvent) {
    await this.saveEvent<MedicineEntry>({
      date: event.date,
      medicine: event.medicine,
      comment: event.comment || null
    }, MEDICINE_COLLECTION)
    this.refreshMedicine()
  }

  async removeFood(docId: string) {
    await this.removeItem(docId, FOOD_COLLECTION)
    this.refreshFoods()
  }

  async removeMedicine(docId: string) {
    await this.removeItem(docId, MEDICINE_COLLECTION)
    this.refreshMedicine()
  }

  private async removeItem(docId: string, subCollection: string) {
    try {
      console.log('Remove item from collection', subCollection, docId)
      await this.store.collection('dogs').doc(this.dogId).collection(subCollection).doc(docId).delete()
      this.snack.open('A bejegyzés sikeresen törölve', 'Ok', { duration: 2000 })
    } catch (e) {
      console.error(e)
      this.snack.open('Nem sikerült törölni a bejegyzést', 'Jaj most mi legyen?')
      throw e
    }
  }

  private async saveEvent<T>(data: Partial<T>, subCollection: string) {
    try {
      console.log('Saving for collection', subCollection, data)
      await this.store.collection('dogs').doc(this.dogId).collection<T>(subCollection).add({
        ...data,
        createdAt: new Date(),
        createdBy: (await this.auth.currentUser).email
      } as any)
      this.snack.open('Bejegyzés elmentve', 'Ok csá')
    } catch (e) {
      console.error(e)
      this.snack.open('Nem sikerült menteni a bejegyzést', 'Most mi tévő legyek?')
      throw e
    }

  }

}
