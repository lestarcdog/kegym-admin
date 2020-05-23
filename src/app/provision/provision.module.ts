import { NgModule } from '@angular/core';
import { ChartModule } from 'angular-highcharts';
import { SharedModule } from '../shared.module';
import { ChartComponent } from './chart/chart.component';
import { FoodComponent } from './food/food.component';
import { MedicineComponent } from './medicine/medicine.component';
import { ProvisionComponent } from './provision.component';

@NgModule({
  declarations: [
    ProvisionComponent,
    FoodComponent,
    MedicineComponent,
    ChartComponent
  ],
  imports: [SharedModule, ChartModule]
})
export class ProvisionModule {

}
