import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs/operators'

@Component({
  selector: 'app-navmenu',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  constructor(private auth: AngularFireAuth, private router: Router) { }

  currentUserName = ''
  sideNavOpen = false
  showBackToList = false

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.showBackToList = e.url !== '/dog-list'
    })
    this.auth.user.subscribe(u => {
      this.currentUserName = u?.email
      this.sideNavOpen = true
    })
  }

  async logout() {
    if (confirm('Biztos ki szeretnél jelentkezni?')) {
      await this.auth.signOut()
      this.router.navigate(['/login'])
    }
  }



}
