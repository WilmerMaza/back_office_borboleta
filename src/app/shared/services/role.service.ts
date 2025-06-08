import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { Module, RoleModel } from "../interface/role.interface";

@Injectable({
  providedIn: "root",
})
export class RoleService {

  constructor(private http: HttpClient) {}

  getRoleModules(): Observable<Module[]> {
    return this.http.get<Module[]>(`assets/data/module.json`);
  }

  getRoles(payload?: Params): Observable<RoleModel> {
    return this.http.get<RoleModel>(`assets/data/role.json`, {
      params: payload,
    });
  }
}
