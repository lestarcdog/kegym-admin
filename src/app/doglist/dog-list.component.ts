import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore'
import { FormControl } from '@angular/forms'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { AssistanceDogType, asssistanceDogType, Dog } from 'src/domain/dog'
import { mapFirebaseDog } from '../service/mapper/dogMapper'


export class ListDog extends Dog {
  docId: string
}

type DogListPredicate = (key: string, dog: ListDog) => boolean
interface DogListFilter {
  control: FormControl
  key?: string
  predicate: DogListPredicate
}

const fullColumns = ['index', 'name', 'birthDate', 'assistanceTypes', 'owner', 'phone', 'trainer', 'actions']
const shortColumns = ['name', 'owner', 'actions']

@Component({
  styleUrls: ['./dog-list.component.scss'],
  templateUrl: './dog-list.component.html'
})
export class DogListComponent implements OnInit, OnDestroy {
  displayedColumns = [];
  dogList: MatTableDataSource<ListDog>

  // search controls
  dogNameFilter = new FormControl(null)
  assistanceTypeFilter = new FormControl(null)
  compositeSearchFilter = new FormControl(null)

  assistanceTypes = asssistanceDogType

  private currentFilters: { [key: string]: DogListFilter } = {}

  private sub = new Subscription()

  @ViewChild(MatSort, { static: true })
  sort: MatSort

  constructor(
    private store: AngularFirestore,
    private router: Router, private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.displayedColumns = window.innerWidth < 400 ? shortColumns : fullColumns
    this.compositeSearchFilter.disable()
    this.assistanceTypeFilter.disable()
    this.dogNameFilter.disable()

    this.store.collection<Dog>('dogs').get().subscribe((snapshot: QuerySnapshot<Dog>) => {
      const fullDogList = snapshot.docs.map(doc => ({
        ...mapFirebaseDog(doc.data()),
        docId: doc.id
      }) as ListDog)
      this.dogList = new MatTableDataSource<ListDog>(fullDogList)
      this.dogList.sort = this.sort
      this.sort.sort(({ id: 'name', start: 'asc', disableClear: false}))

      this.dogNameFilter.enable()
      this.assistanceTypeFilter.enable()
      this.compositeSearchFilter.enable()
    })

    this.dogList = new MatTableDataSource<ListDog>()
    this.dogList.sort = this.sort

    // dog name
    this.onFilterChange(this.dogNameFilter, 'name', (key, d) => {
      return d.name.toLocaleLowerCase().includes(key)
    })

    // dog type
    this.onFilterChange(this.assistanceTypeFilter, 'type', (key, d) => {
      return d.assistanceTypes.includes(key as AssistanceDogType)
    }, false)

    // composite search
    this.onFilterChange(this.compositeSearchFilter, 'all', (key, d) => {
      return JSON.stringify(d).toLocaleLowerCase().includes(key)
    })

    // always the last one of the composite filters
    this.setDogListFilterPredicate()
  }

  private onFilterChange(control: FormControl, queryName: string, predicate: DogListPredicate, toLowerCase = true) {
    const initialNeedle = this.route.snapshot.queryParamMap.get(queryName)
    control.setValue(initialNeedle)

    this.currentFilters[queryName] = { predicate, control }

    const s = control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((key: string) => {
      this.currentFilters[queryName] = {
        key: toLowerCase && key ? key.toLocaleLowerCase() : key,
        predicate,
        control
      }
      // only make the filter change to make filtering happen
      this.dogList.filter = Object.values(this.currentFilters).filter(f => f.key).map(f => f.key).join('')
      this.router.navigate([], {
        queryParams: { [queryName]: key },
        queryParamsHandling: 'merge'
      })
    })

    this.sub.add(s)
  }

  private setDogListFilterPredicate() {
    const aggregate = (dog: ListDog) => {
      const filters = Object.values(this.currentFilters)
      let result = true
      for (const filter of filters) {
        const { key, predicate } = filter
        if (key) {
          result = result && predicate(key, dog)
          // short circuit
          if (!result) {
            return false
          }
        }
      }
      return result
    }
    this.dogList.filterPredicate = aggregate
  }

  hasAnySearchFieldsSet() {
    return Object.values(this.currentFilters).find(f => f.key)
  }

  clearSearchFields() {
    Object.values(this.currentFilters).forEach(f => f.control.reset(undefined))
  }

  getAllAssistanceMultilineName(dog: ListDog) {
    return dog.assistanceTypes.map(id => AssistanceDogType[id]).join('<br />')
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

}
