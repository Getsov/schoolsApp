import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private auth: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot): Observable<boolean> {
    const expectedRoles = route.data.roles;
    console.log('roles: ', expectedRoles);
    return this.auth.user.pipe(
      take(1),
      map(user => {
        console.log('user in guard: ', user);
        if(!user) {
          this.router.navigateByUrl('/login');
          return false;
        } else {
          let role = user['role'];
          if(expectedRoles.indexOf(role) >= 0) {
            return true;
          } else {
            this.router.navigateByUrl('/login');
            return false;
          }
        }
      })
    )
  }
  
}
