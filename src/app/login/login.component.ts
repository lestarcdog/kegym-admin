import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private auth: AngularFireAuth, private router: Router) { }

  loginGroup = new FormGroup({
    username: new FormControl(null, Validators.email),
    password: new FormControl(null, Validators.minLength(4))
  })

  loading = false
  logginError = ''

  async submit() {
    const creds = this.loginGroup.value
    this.loading = true
    try {
      await this.auth.signInWithEmailAndPassword(creds.username, creds.password)
      this.router.navigate(['/'])
    } catch (e) {
      console.log(e)
      this.logginError = 'Hibás bejelentkezési adatok!'
    } finally {
      this.loading = false
    }
  }
}
