import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { UserModel, User } from "../interface/user.interface";

@Injectable({
  providedIn: "root",
})
export class UserService {

  constructor(private http: HttpClient) {}

  getUsers(payload?: Params): Observable<UserModel> {
    return this.http.get<UserModel>(`${environment.URLS}/users`, { params: payload });
  }

  // 🚀 Creación de usuario con POST a /register
  createUser(payload: User): Observable<User> {
    return this.http.post<User>(`${environment.URLS}/register`, payload);
  }

  // 🚀 Editar usuario con POST a /register (forzado, aunque normalmente sería un PUT/PATCH)
  updateUser(id: number, payload: User): Observable<User> {
    return this.http.post<User>(`${environment.URLS}/register`, { ...payload, id });
  }
}
