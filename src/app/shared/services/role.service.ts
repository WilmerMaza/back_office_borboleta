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
    // El interceptor agregará automáticamente el token si es necesario
    return this.http.get<Module[]>(`assets/data/module.json`);
  }

  getRoles(payload?: Params): Observable<RoleModel> {
    // El interceptor agregará automáticamente el token
    return this.http.get<RoleModel>(`${environment.URL}/roles`, {
      params: payload
    });
  }

  createRole(roleData: any): Observable<any> {
    // El interceptor agregará automáticamente el token
    return this.http.post(`${environment.URL}/roles`, roleData);
  }

  updateRole(roleId: number, roleData: any): Observable<any> {
    // El interceptor agregará automáticamente el token
    return this.http.put(`${environment.URL}/roles/${roleId}`, roleData);
  }

  deleteRole(roleId: number): Observable<any> {
    // El interceptor agregará automáticamente el token
    return this.http.delete(`${environment.URL}/roles/${roleId}`);
  }
}
