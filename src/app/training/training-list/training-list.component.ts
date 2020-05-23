import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { firebaseToMomentDate } from 'src/app/service/time-util';
import { AssistanceDogType, Dog, TrainingMilestone } from 'src/domain/dog';
import { TrainingType } from 'src/domain/training';
import { milestoneTimeDifference } from '../milestone-time-diff';
import { TrainingEntryItem } from '../training.component';

@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.scss']
})
export class TrainingListComponent implements OnInit, OnDestroy {

  filteredEntries: TrainingEntryItem[] = []
  newEntry: TrainingEntryItem = undefined

  trainingTypeFilter = new FormControl('')


  private allEntries: TrainingEntryItem[] = []

  @Input()
  set entries(e: TrainingEntryItem[]) {
    this.allEntries = e
    this.filterEntries(this.trainingTypeFilter.value)
  }

  @Input()
  dog: Dog

  @Input()
  dogId: string

  @Input()
  trainingTypes: TrainingType[] = []

  @Input()
  loading = false

  @Output()
  save = new EventEmitter<TrainingEntryItem>()

  @Output()
  delete = new EventEmitter<string>()

  private sub = new Subscription()

  ngOnInit(): void {
    const filterSub = this.trainingTypeFilter.valueChanges.subscribe(key => this.filterEntries(key))
    this.sub.add(filterSub)
  }

  private filterEntries(key: string) {
    if (key) {
      this.filteredEntries = this.allEntries.filter(e => e.type.hu === key)
    } else {
      this.filteredEntries = this.allEntries
    }
  }

  addNewEntry() {
    if (!this.newEntry) {
      this.newEntry = {} as TrainingEntryItem
    }
  }

  calcMilestoneHeader(type: AssistanceDogType): string {
    if (this.dog && this.dog.trainingMileStones && this.dog.trainingMileStones[type]) {
      const milestone = this.dog.trainingMileStones[type]
      let date: moment.Moment
      let preText: string
      if (milestone.examDate) {
        preText = 'Vizsga'
        date = firebaseToMomentDate(milestone.examDate)
      } else if (milestone.handoverDate) {
        preText = 'Átadás'
        date = firebaseToMomentDate(milestone.handoverDate)
      } else if (milestone.trainingStartDate) {
        preText = 'Kiképzés'
        date = firebaseToMomentDate(milestone.trainingStartDate)
      } else {
        return 'Nem kezdődött el a kiképzés'
      }

      return `${preText}${milestoneTimeDifference(date)}`
    } else {
      return 'Nem kezdődött el a kiképzés'
    }
  }

  getTrainingMilestoneOf(id: AssistanceDogType): TrainingMilestone | undefined {
    return this.dog && this.dog.trainingMileStones ? this.dog.trainingMileStones[id] : undefined
  }

  getAssistanceTypeName(id: AssistanceDogType) {
    return AssistanceDogType[id]
  }

  saveEntry(item: TrainingEntryItem) {
    this.save.emit(item)
    this.newEntry = undefined
  }

  deleteEntry(docId: string) {
    // if doc id present delegate the call to the parent to do the real deletion in the store
    if (docId) {
      this.delete.emit(docId)
    } else {
      this.newEntry = undefined
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

}
