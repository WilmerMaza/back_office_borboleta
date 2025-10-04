import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { Params } from "../interface/core.interface";
import { UserModel, User } from "../interface/user.interface";

@Injectable({
  providedIn: "root",
})
export class UserService {

  constructor(private http: HttpClient) {}


  getUsers(payload?: Params): Observable<UserModel> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const params: any = { ...payload };
    // Normalizar paginación: usar 'limit' en lugar de 'paginate'
    if (params && params.paginate && !params.limit) {
      params.limit = params.paginate;
      delete params.paginate;
    }
    // SIEMPRE usar /api/admin/users para obtener solo usuarios administrativos
    const url = `${environment.URL}/admin/users`;


    return this.http.get<UserModel>(url, {
      params,
      headers
    }).pipe(
      tap(response => {
        // Usuarios obtenidos exitosamente
      })
    );
  }

  // GET /api/users/:id - Obtener un usuario específico
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${environment.URL}/users/'permissions',${id}`);
  }

  // POST /admin/users - Crear un nuevo usuario
  createUser(user: any): Observable<User> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Asegurar que se incluya role_id si no está presente
    const userData = { ...user };
    if (user.role === 'consumer' && !user.role_id) {
      userData.role_id = 2; // Asumiendo que 2 es el ID del rol consumer
    }
    
    
    return this.http.post<User>(`${environment.URL}/admin/users`, userData, {
      headers: headers
    }).pipe(
      tap(response => {
        // Usuario creado exitosamente
      })
    );
  }

  // PUT /admin/users/:id - Actualizar un usuario existente / asignar rol
  updateUser(user: Partial<User>, id: number): Observable<User> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    return this.http.put<User>(`${environment.URL}/admin/users/${id}`, user, { headers });
  }

  // DELETE /api/users/:id - Eliminar un usuario
  deleteUser(id: number): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    
    return this.http.delete(`${environment.URL}/admin/users/${id}`, {
      headers
    });
  }

  // Método privado para obtener el token del localStorage
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
