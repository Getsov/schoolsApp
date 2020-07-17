import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";
import { environment } from "src/environments/environment";
import { take, map, switchMap } from "rxjs/operators";
import { Platform } from "@ionic/angular";
import { Observable, from } from "rxjs";

export const TOKEN_KEY = "access_token";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private url = environment.apiUrl;
  public user: Observable<any>;

  constructor(
    private storage: Storage,
    private http: HttpClient,
    public helper: JwtHelperService,
    private plt: Platform
  ) {
    this.loadStoredToken();
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${this.url}/auth`, credentials).pipe(
      take(1),
      map((res) => res["token"]),
      switchMap((token: string) => {
        return from(this.storage.set(TOKEN_KEY, token)).pipe(
          map((result) => token)
        );
      }),
      map((token: string) => {
        return this.helper.decodeToken(token);
      })
    );
  }

  loadStoredToken() {
    let platformObs = from(this.plt.ready());
    let storageObs = from(this.storage.get(TOKEN_KEY));

    this.user = platformObs.pipe(
      switchMap(() => storageObs),
      map((token) => {
        if (token && !this.helper.isTokenExpired(token)) {
          return this.helper.decodeToken(token);
        } else {
          return null;
        }
      })
    );
  }
}
