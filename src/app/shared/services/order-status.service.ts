import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { OrderStatusModel, OrderStatus } from '../interface/order-status.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderStatusService {

  constructor(private http: HttpClient) {}

  getOrderStatus(payload?: Params): Observable<OrderStatusModel> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${environment.URL}/order-statuses`, {
      headers: headers,
      params: payload
    }).pipe(
      map((response: any) => {
        // Manejar diferentes estructuras de respuesta
        let data: OrderStatus[] = [];
        let total = 0;
        
        if (response?.data && Array.isArray(response.data)) {
          data = response.data as OrderStatus[];
          total = response.total || response.data.length;
        } else if (Array.isArray(response)) {
          data = response as OrderStatus[];
          total = response.length;
        }
        
        return {
          data: data,
          total: total,
          current_page: response?.current_page || 1,
          last_page: response?.last_page || 1,
          per_page: response?.per_page || data.length,
          from: response?.from || 1,
          to: response?.to || data.length
        } as OrderStatusModel;
      })
    );
  }
  
  // Método privado para obtener el token del localStorage
  private getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('access_token');
    }
    return null;
  }
  
}
