import { Component, OnDestroy, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore'
import { FormControl } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { TrainingEntry, trainingTypesArray } from 'src/domain/training'

export interface TrainingEntryItem extends TrainingEntry {
  docId: string
}

@Component({
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit, OnDestroy {

  constructor(
    private storage: AngularFirestore,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    private auth: AngularFireAuth
  ) { }

  entries: TrainingEntryItem[] = []
  filteredEntries: TrainingEntryItem[] = []
  newEntry: TrainingEntryItem = undefined
  dogId: string
  dogName = ''
  loading = false

  private sub = new Subscription()

  trainingTypeFilter = new FormControl('')
  trainingTypes = trainingTypesArray

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(param => {
        this.dogId = param.get('dogId')
        this.dogName = param.get('dogName')
        return this.dogId
      })
    ).subscribe(() => this.refreshEntries(), err => console.error(err))

    const filterSub = this.trainingTypeFilter.valueChanges.subscribe(key => this.filterEntries(key))
    this.sub.add(filterSub)

  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

  private filterEntries(key: string) {
    if (key) {
      this.filteredEntries = this.entries.filter(e => e.type === key)
    } else {
      this.filteredEntries = this.entries
    }

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
      this.filterEntries(this.trainingTypeFilter.value)
    }, err => console.error(err))
  }

  private getAllEntries(dogId: string) {
    return this.getDogDoc(dogId).collection('training', r => r.orderBy('date', 'desc')).get()
  }

  private getDogDoc(dogId: string) {
    return this.storage.collection('dogs').doc(dogId)
  }

  private getTrainingDoc(dogId: string, trainingId: string) {
    return this.getDogDoc(dogId).collection('training').doc<TrainingEntry>(trainingId)
  }

  addNewEntry() {
    if (!this.newEntry) {
      this.newEntry = {} as TrainingEntryItem
    }
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
        this.newEntry = undefined
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
    if (!docId) {
      this.newEntry = undefined
      return
    }

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
