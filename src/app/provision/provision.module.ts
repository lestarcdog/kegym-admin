import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { FoodComponent } from './food/food.component';
import { MedicineComponent } from './medicine/medicine.component';
import { ProvisionComponent } from './provision.component';

@NgModule({
  declarations: [
    ProvisionComponent,
    FoodComponent,
    MedicineComponent
  ],
  imports: [SharedModule]
})
export class ProvisionModule {

}
