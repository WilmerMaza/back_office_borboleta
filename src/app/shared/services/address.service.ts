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
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('Creando dirección:', address);
    console.log('URL:', `${environment.URL}/admin/user-addresses`);
    console.log('Token incluido:', !!token);
    
    return this.http.post<UserAddress>(`${environment.URL}/admin/user-addresses`, address, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Dirección creada exitosamente:', response);
      })
    );
  }

  // GET /admin/user-addresses/:userId - Obtener direcciones de un usuario
  getUserAddresses(userId: number): Observable<UserAddress[]> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<UserAddress[]>(`${environment.URL}/admin/user-addresses/${userId}`, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Direcciones obtenidas:', response);
      })
    );
  }

  // PUT /admin/user-addresses/:id - Actualizar una dirección
  updateAddress(address: UserAddress, id: number): Observable<UserAddress> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.put<UserAddress>(`${environment.URL}/admin/user-addresses/${id}`, address, {
      headers: headers
    });
  }

  // DELETE /admin/user-addresses/:id - Eliminar una dirección
  deleteAddress(id: number): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.delete(`${environment.URL}/admin/user-addresses/${id}`, {
      headers: headers
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
