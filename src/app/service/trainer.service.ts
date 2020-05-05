import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Trainer } from 'src/domain/dog';

@Injectable({ providedIn: 'root' })
export class TrainersService {

  private cachedTrainers: Observable<Trainer[]>

  constructor(private store: AngularFirestore) {
    this.cachedTrainers = this.store.collection<Trainer>('trainers').valueChanges().pipe(
      shareReplay(1)
    )
  }


  get trainers(): Observable<Trainer[]> {
    return this.cachedTrainers
  }
}
