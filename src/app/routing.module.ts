import { NgModule } from '@angular/core'
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard'
import { RouterModule, Routes } from '@angular/router'
import { DocumentsComponent } from './documents/documents.component'
import { DogListComponent } from './doglist/dog-list.component'
import { LoginComponent } from './login/login.component'
import { NewDogComponent } from './newdog/new-dog.component'
import { TrainersSettingsComponent } from './settings/trainers/trainers-settings.component'
import { TrainingComponent } from './training/training.component'


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'new-dog', component: NewDogComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'dog-list', component: DogListComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'dog/:dogId/edit', component: NewDogComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'dog/training', component: TrainingComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'dog/documents', component: DocumentsComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'trainers', component: TrainersSettingsComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: '**', redirectTo: 'dog-list' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
