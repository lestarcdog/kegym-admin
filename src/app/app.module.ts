import { registerLocaleData } from '@angular/common'
import hunLocal from '@angular/common/locales/hu'
import { LOCALE_ID, NgModule } from '@angular/core'
import { AngularFireModule } from '@angular/fire'
import { AngularFireAuthModule } from '@angular/fire/auth'
import { AngularFireAuthGuardModule } from '@angular/fire/auth-guard'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { ReactiveFormsModule } from '@angular/forms'
import { MatMomentDateModule } from '@angular/material-moment-adapter'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MAT_DATE_LOCALE } from '@angular/material/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSliderModule } from '@angular/material/slider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { MatTooltipModule } from '@angular/material/tooltip'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import 'moment'
import { environment } from '../environments/environment'
import { AppComponent } from './app.component'
import { DogListComponent } from './doglist/dog.list.component'
import { LoginComponent } from './login/login.component'
import { NavComponent } from './nav/nav.component'
import { NewDogComponent } from './newdog/new.dog.component'
import { AppRoutingModule } from './routing.module'
import { TrainingEntryComponent } from './training/training-entry/training-entry.component'
import { TrainingComponent } from './training/training.component'



registerLocaleData(hunLocal)

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavComponent,
    NewDogComponent,
    DogListComponent,
    TrainingComponent,
    TrainingEntryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireAuthGuardModule,
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
    MatCardModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'hu-HU' },
    { provide: LOCALE_ID, useValue: 'hu' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
