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
    const params: any = { ...payload };
    // Normalizar paginación: usar 'limit' en lugar de 'paginate'
    if (params && params.paginate && !params.limit) {
      params.limit = params.paginate;
      delete params.paginate;
    }

    const url = `${environment.URL}/admin/users`;

    // El interceptor agregará automáticamente el token
    return this.http.get<UserModel>(url, { params }).pipe(
      tap(response => {
        // Usuarios obtenidos exitosamente
      })
    );
  }


  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${environment.URL}/users/'permissions',${id}`);
  }


  createUser(user: any): Observable<User> {
    const userData = { ...user };
    if (user.role === 'consumer' && !user.role_id) {
      userData.role_id = 2; // Asumiendo que 2 es el ID del rol consumer
    }
    
    // El interceptor agregará automáticamente el token
    return this.http.post<User>(`${environment.URL}/admin/users`, userData).pipe(
      tap(response => {
        // Usuario creado exitosamente
      })
    );
  }

  // PUT /admin/users/:id - Actualizar un usuario existente / asignar rol
  updateUser(user: Partial<User>, id: number): Observable<User> {
    // El interceptor agregará automáticamente el token
    return this.http.put<User>(`${environment.URL}/admin/users/${id}`, user);
  }

  // DELETE /api/users/:id - Eliminar un usuario
  deleteUser(id: number): Observable<any> {
    // El interceptor agregará automáticamente el token
    return this.http.delete(`${environment.URL}/admin/users/${id}`);
  }

}
