import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { AngularFireAuthModule } from '@angular/fire/auth'
import { AngularFireAuthGuardModule } from '@angular/fire/auth-guard'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { AngularFireStorageModule } from '@angular/fire/storage'
import { ReactiveFormsModule } from '@angular/forms'
import { MatMomentDateModule } from '@angular/material-moment-adapter'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSliderModule } from '@angular/material/slider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatSortModule } from '@angular/material/sort'
import { MatStepperModule } from '@angular/material/stepper'
import { MatTableModule } from '@angular/material/table'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TooltipModule } from 'ng2-tooltip-directive'


const modules = [
  CommonModule,
  ReactiveFormsModule,
  // Firebase
  AngularFireAuthModule,
  AngularFirestoreModule,
  AngularFireAuthGuardModule,
  AngularFireStorageModule,
  // Material
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatSidenavModule,
  MatIconModule,
  MatDatepickerModule,
  MatMomentDateModule,
  MatSnackBarModule,
  MatTableModule,
  MatSortModule,
  MatSelectModule,
  MatTooltipModule,
  MatSliderModule,
  MatCardModule,
  MatProgressBarModule,
  MatDividerModule,
  MatAutocompleteModule,
  MatStepperModule,
  MatRadioModule,
  MatExpansionModule,
  // 3rd party modules
  TooltipModule
]

@NgModule({
  imports: modules,
  exports: modules
})
export class SharedModule { }
