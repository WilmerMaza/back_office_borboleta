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
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<Module[]>(`assets/data/module.json`, { headers });
  }

  getRoles(payload?: Params): Observable<RoleModel> {
    console.log('RoleService.getRoles() ejecutándose...');
    console.log('URL:', `assets/data/role.json`);
    console.log('Payload:', payload);
    
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    console.log('Token incluido:', !!token);
    
    return this.http.get<RoleModel>(`${environment.URL}/roles`, {
      params: payload,
      headers
    });
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }
}
