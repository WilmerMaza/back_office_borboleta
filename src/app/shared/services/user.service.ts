import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { UserModel } from "../interface/user.interface";

@Injectable({
  providedIn: "root",
})
export class UserService {

  constructor(private http: HttpClient) {}

  getUsers(payload?: Params): Observable<UserModel> {
    return this.http.get<UserModel>(`${environment.URL}/user.json`, { params: payload });
  }

}
