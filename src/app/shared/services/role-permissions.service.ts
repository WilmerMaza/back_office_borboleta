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
    // El interceptor agregará automáticamente el token
    return this.http.get(`${environment.URL}/roles/${roleId}/permissions`);
  }

  // POST /api/roles/:id/permissions - Asignar permisos a un rol
  assignPermissions(roleId: number, permissionIds: number[]): Observable<any> {
    // El interceptor agregará automáticamente el token
    return this.http.post(`${environment.URL}/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    });
  }

  // PUT /api/roles/:id/permissions - Actualizar permisos de un rol (reemplaza todos)
  updatePermissions(roleId: number, permissionIds: number[]): Observable<any> {
    // El interceptor agregará automáticamente el token
    return this.http.put(`${environment.URL}/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    });
  }

  // DELETE /api/roles/:id/permissions - Remover permisos específicos de un rol
  removePermissions(roleId: number, permissionIds: number[]): Observable<any> {
    // El interceptor agregará automáticamente el token
    return this.http.delete(`${environment.URL}/roles/${roleId}/permissions`, {
      body: { permission_ids: permissionIds }
    });
  }
}

