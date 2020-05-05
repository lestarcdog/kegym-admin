import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { TrainingEntryComponent } from './training-entry/training-entry.component';
import { TrainingMilestonesComponent } from './training-milestones/training-milestones.component';
import { TrainingComponent } from './training.component';

@NgModule({
  declarations: [
    TrainingComponent,
    TrainingEntryComponent,
    TrainingMilestonesComponent,
  ],
  imports: [
    SharedModule
  ]
})
export class TrainingModule {}
