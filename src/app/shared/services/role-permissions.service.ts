import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RolePermissionsService {

  constructor(private http: HttpClient) {}

  // GET /api/roles/:id/permissions - Obtener permisos de un rol
  getRolePermissions(roleId: number): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get(`${environment.URL}/roles/${roleId}/permissions`, {
      headers
    });
  }

  // POST /api/roles/:id/permissions - Asignar permisos a un rol
  assignPermissions(roleId: number, permissionIds: number[]): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.post(`${environment.URL}/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    }, {
      headers
    });
  }

  // PUT /api/roles/:id/permissions - Actualizar permisos de un rol (reemplaza todos)
  updatePermissions(roleId: number, permissionIds: number[]): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.put(`${environment.URL}/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    }, {
      headers
    });
  }

  // DELETE /api/roles/:id/permissions - Remover permisos específicos de un rol
  removePermissions(roleId: number, permissionIds: number[]): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.delete(`${environment.URL}/roles/${roleId}/permissions`, {
      headers,
      body: { permission_ids: permissionIds }
    });
  }

  private getToken(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('access_token');
      }
    } catch (error) {
      console.warn('No se pudo acceder a localStorage:', error);
    }
    return null;
  }
}

