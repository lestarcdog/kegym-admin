import { NgModule } from '@angular/core'
import { AngularFireModule } from '@angular/fire'
import { AngularFireAuthModule } from '@angular/fire/auth'
import { AngularFireAuthGuardModule } from '@angular/fire/auth-guard'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { ReactiveFormsModule } from '@angular/forms'
import { MatMomentDateModule } from '@angular/material-moment-adapter'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DATE_LOCALE } from '@angular/material/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSnackBarModule } from '@angular/material/snack-bar'
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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavComponent,
    NewDogComponent,
    DogListComponent
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
    MatSnackBarModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'hu-HU' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
