import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { QuerySnapshot } from '@angular/fire/firestore/interfaces';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Trainer } from 'src/domain/dog';

@Injectable({ providedIn: 'root' })
export class TrainersService {

  private cachedTrainers: Observable<Trainer[]>

  constructor(private store: AngularFirestore) {
    this.cachedTrainers = this.store.collection<Trainer>('trainers').get().pipe(
      map((data: QuerySnapshot<Trainer>) => data.docs.map(d => d.data())),
      shareReplay(1)
    )
  }


  get trainers(): Observable<Trainer[]> {
    return this.cachedTrainers
  }
}
