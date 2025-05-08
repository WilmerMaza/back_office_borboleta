import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { AccountUser } from "../interface/account.interface";

@Injectable({
  providedIn: "root",
})
export class AccountService {

  constructor(private http: HttpClient) {}

  getUserDetails(): Observable<AccountUser> {
    return this.http.get<AccountUser>(`${environment.URL}/self.json`);
  }
   
}
