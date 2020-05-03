import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { Router } from '@angular/router'

@Component({
  selector: 'app-navmenu',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  constructor(private auth: AngularFireAuth, private router: Router) { }

  currentUserName = ''

  ngOnInit(): void {
    this.auth.user.subscribe(u => this.currentUserName = u?.email)
  }

  async logout() {
    if (confirm('Biztos ki szeretnél jelentkezni?')) {
      await this.auth.signOut()
      this.router.navigate(['/login'])
    }
  }



}
