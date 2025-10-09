import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { UserAddress } from "../interface/user.interface";

@Injectable({
  providedIn: "root",
})
export class AddressService {

  constructor(private http: HttpClient) {}

  // POST /admin/user-addresses - Crear una nueva dirección
  createAddress(address: UserAddress): Observable<UserAddress> {
    // El interceptor agregará automáticamente el token
    return this.http.post<UserAddress>(`${environment.URL}/admin/user-addresses`, address);
  }

  // GET /admin/user-addresses/:userId - Obtener direcciones de un usuario
  getUserAddresses(userId: number): Observable<UserAddress[]> {
    // El interceptor agregará automáticamente el token
    return this.http.get<UserAddress[]>(`${environment.URL}/admin/user-addresses/${userId}`);
  }

  // PUT /admin/user-addresses/:id - Actualizar una dirección
  updateAddress(address: UserAddress, id: number): Observable<UserAddress> {
    // El interceptor agregará automáticamente el token
    return this.http.put<UserAddress>(`${environment.URL}/admin/user-addresses/${id}`, address);
  }

  // DELETE /admin/user-addresses/:id - Eliminar una dirección
  deleteAddress(id: number): Observable<any> {
    // El interceptor agregará automáticamente el token
    return this.http.delete(`${environment.URL}/admin/user-addresses/${id}`);
  }

}
