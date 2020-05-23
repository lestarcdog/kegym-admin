import { NgModule } from '@angular/core'
import { ChartModule } from 'angular-highcharts'
import { SharedModule } from '../shared.module'
import { TrainingChartComponent } from './training-chart/training-chart.component'
import { TrainingEntryComponent } from './training-entry/training-entry.component'
import { TrainingListComponent } from './training-list/training-list.component'
import { TrainingMilestonesComponent } from './training-milestones/training-milestones.component'
import { TrainingComponent } from './training.component'



@NgModule({
  declarations: [
    TrainingComponent,
    TrainingEntryComponent,
    TrainingMilestonesComponent,
    TrainingChartComponent,
    TrainingListComponent,
  ],
  imports: [
    SharedModule,
    ChartModule
  ]
})
export class TrainingModule { }
