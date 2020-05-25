import { registerLocaleData } from '@angular/common'
import hunLocal from '@angular/common/locales/hu'
import { LOCALE_ID, NgModule } from '@angular/core'
import { AngularFireModule } from '@angular/fire'
import { MatDateFormats, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import 'moment'
import { environment } from 'src/environments/environment'
import { AppComponent } from './app.component'
import { TrainerSelectComponent } from './components/trainer-select/trainer-select.component'
import { DocumentEntryComponent } from './documents/document-entry/document-entry.component'
import { DocumentSelectComponent } from './documents/document-select/document-select.component'
import { DocumentsComponent } from './documents/documents.component'
import { DogListComponent } from './doglist/dog-list.component'
import { MissingDocumentsComponent } from './doglist/missing-documents/missing-documents.component'
// load once
import './highcharts.module'
import { LoginComponent } from './login/login.component'
import { NavComponent } from './nav/nav.component'
import { NewDogComponent } from './newdog/new-dog.component'
import { ProvisionModule } from './provision/provision.module'
import { AppRoutingModule } from './routing.module'
import { TrainersSettingsComponent } from './settings/trainers/trainers-settings.component'
import { TrainingTypeComponent } from './settings/training-type/training-type.component'
import { SharedModule } from './shared.module'
import { TrainingModule } from './training/training.module'

registerLocaleData(hunLocal)

const dateFormat: MatDateFormats = {
  parse: {
    dateInput: 'YYYY.MM.DD'
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavComponent,
    NewDogComponent,
    DogListComponent,
    DocumentsComponent,
    DocumentEntryComponent,
    DocumentSelectComponent,
    TrainerSelectComponent,
    TrainersSettingsComponent,
    MissingDocumentsComponent,
    TrainingTypeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    SharedModule,
    TrainingModule,
    ProvisionModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'hu-HU' },
    { provide: LOCALE_ID, useValue: 'hu' },
    { provide: MAT_DATE_FORMATS, useValue: dateFormat }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
