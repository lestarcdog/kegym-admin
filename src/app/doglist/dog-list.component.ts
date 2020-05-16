import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { AngularFirestore } from '@angular/fire/firestore'
import { QuerySnapshot } from '@angular/fire/firestore/interfaces'
import { FormControl } from '@angular/forms'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { AssistanceDogType, Dog } from 'src/domain/dog'
import { mapFirebaseDog } from '../service/mapper/dogMapper'


export class ListDog extends Dog {
  docId: string
}

const fullColumns = ['name', 'birthDate', 'assistanceTypes', 'owner', 'phone', 'trainer', 'actions'];
const shortColumns = ['name', 'owner', 'actions']

@Component({
  styleUrls: ['./dog-list.component.scss'],
  templateUrl: './dog-list.component.html'
})
export class DogListComponent implements OnInit, OnDestroy {
  displayedColumns = [];
  dogList: MatTableDataSource<ListDog>
  filterKeyControl = new FormControl(null)

  private sub = new Subscription()

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  isMobile

  constructor(
    private store: AngularFirestore,
    private router: Router, private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.displayedColumns = window.innerWidth < 400 ? shortColumns : fullColumns

    this.filterKeyControl.disable()

    this.store.collection<Dog>('dogs').get().subscribe((snapshot: QuerySnapshot<Dog>) => {
      const fullDogList = snapshot.docs.map(doc => ({
        ...mapFirebaseDog(doc.data()),
        docId: doc.id
      }) as ListDog)
      this.dogList = new MatTableDataSource<ListDog>(fullDogList)
      this.dogList.sort = this.sort
      this.filterKeyControl.enable()
    })

    const initialFilterKey = this.route.snapshot.queryParamMap.get('key')
    this.filterKeyControl.setValue(initialFilterKey)

    this.sub.add(this.filterKeyControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(key => {
      this.dogList.filter = key
      this.router.navigate([], {
        queryParams: { key },
      })
    }))
  }

  getAllAssistanceMultilineName(dog: ListDog) {
    return dog.assistanceTypes.map(id => AssistanceDogType[id]).join('<br />')
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

}
