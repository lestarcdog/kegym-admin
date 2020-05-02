import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { QuerySnapshot } from '@angular/fire/firestore/interfaces';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Dog } from 'src/domain/dog';


class ListDog extends Dog {
  docId: string
}

@Component({
  styleUrls: ['./dog.list.component.scss'],
  templateUrl: './dog.list.component.html'
})
export class DogListComponent implements OnInit, OnDestroy {
  displayedColumns = ['name', 'birthDate', 'owner', 'ownerPhone', 'actions'];
  dogList: MatTableDataSource<ListDog>
  filterKeyControl = new FormControl(null)

  private sub = new Subscription()

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(private store: AngularFirestore, private router: Router) { }

  ngOnInit(): void {
    this.filterKeyControl.disable()

    this.store.collection<Dog>('dogs').get().subscribe((snapshot: QuerySnapshot<Dog>) => {
      const fullDogList = snapshot.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id
      }) as ListDog)
      this.dogList = new MatTableDataSource<ListDog>(fullDogList)
      this.dogList.sort = this.sort
      this.filterKeyControl.enable()
    })

    this.sub.add(this.filterKeyControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(key => this.dogList.filter = key))
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

}
