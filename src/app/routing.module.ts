import { NgModule } from '@angular/core';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { DogListComponent } from './doglist/dog.list.component';
import { LoginComponent } from './login/login.component';
import { NewDogComponent } from './newdog/new.dog.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'new-dog', component: NewDogComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'dog-list', component: DogListComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'dog/:dogId/edit', component: NewDogComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: '**', redirectTo: 'new-dog' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
