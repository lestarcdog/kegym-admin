import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { map, switchMap } from 'rxjs/operators'
import { Dog } from 'src/domain/dog'
import { TrainingEntry, TrainingType } from 'src/domain/training'


export interface TrainingEntryItem extends TrainingEntry {
  docId: string
}

@Component({
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  constructor(
    private store: AngularFirestore,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    private auth: AngularFireAuth
  ) { }

  entries: TrainingEntryItem[] = []
  dogId: string
  dog: Dog
  loading = false

  trainingTypes: TrainingType[] = []

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(param => {
        this.dogId = param.get('dogId')
        return this.dogId
      }),
      switchMap(dogId => this.store.collection('dogs').doc<Dog>(dogId).get())
    ).subscribe((dog: DocumentSnapshot<Dog>) => {
      this.dog = dog.data()
      this.refreshEntries()
    }, err => console.error(err))

    this.readTrainingTypes()


  }

  private readTrainingTypes() {
    this.store.collection('training-types').get().subscribe((snap: QuerySnapshot<TrainingType>) =>
      this.trainingTypes = snap.docs.map(d => d.data())
    )
  }

  private refreshEntries() {
    return this.getAllEntries(this.dogId).subscribe((data: QuerySnapshot<TrainingEntry>) => {
      this.entries = data.docs.map(doc => {
        const d = doc.data()
        return {
          docId: doc.id,
          date: (d.date as any).toDate(),
          comment: d.comment,
          progress: d.progress,
          type: d.type,
          createdAt: (d.createdAt as any).toDate(),
          createdBy: d.createdBy,
        }
      })
    }, err => console.error(err))
  }

  private getAllEntries(dogId: string) {
    return this.getDogDoc(dogId).collection('training', r => r.orderBy('date', 'desc')).get()
  }

  private getDogDoc(dogId: string) {
    return this.store.collection('dogs').doc(dogId)
  }

  private getTrainingDoc(dogId: string, trainingId: string) {
    return this.getDogDoc(dogId).collection('training').doc<TrainingEntry>(trainingId)
  }

  async saveEntry(item: TrainingEntryItem) {
    this.loading = true
    try {
      const firebaseEntry = await this.convertEntryItemToItem(item)
      if (item.docId) {
        console.log('Updating item', firebaseEntry)
        await this.getTrainingDoc(this.dogId, item.docId).set(firebaseEntry)
      } else {
        console.log('Creating new entry', firebaseEntry)
        await this.getDogDoc(this.dogId).collection<TrainingEntry>('training').add(firebaseEntry)
      }
      this.refreshEntries()
      this.snack.open(`Edzés ${item.date.toLocaleDateString()} sikeresen frissítve`, 'Ok', { duration: 2000 })
    } catch (e) {
      console.error(e)
      this.snack.open(`Nem sikerült frissíteni a ${item.date?.toLocaleDateString()} bejegyzést: ${e.code} - ${e.message}`, 'Francba')
    } finally {
      this.loading = false
    }
  }


  private async convertEntryItemToItem(item: TrainingEntryItem): Promise<TrainingEntry> {
    const email = (await this.auth.currentUser).email
    return {
      date: item.date,
      type: item.type,
      progress: item.progress,
      comment: item.comment || null,
      createdAt: new Date(),
      createdBy: email
    }
  }

  async deleteEntry(docId: string) {
    if (docId) {
      this.loading = true
      try {
        await this.getTrainingDoc(this.dogId, docId).delete()
        this.refreshEntries()
        this.snack.open('Bejegyzés törölve', 'Ok', { duration: 2000 })
      } catch (e) {
        console.error(e)
        this.snack.open(`Nem lehetett törölni a ${docId} bejegyzést: ${e.code} - ${e.message}`, 'Francba')
      } finally {
        this.loading = false
      }
    }
  }
}
