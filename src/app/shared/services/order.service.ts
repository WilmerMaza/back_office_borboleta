import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Params } from '../interface/core.interface';
import { OrderModel, Order } from '../interface/order.interface';
import { OrderStatusModel, OrderStatus } from '../interface/order-status.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {}

  // GET /api/orders - Obtener todas las órdenes del sistema
  getOrders(payload?: Params): Observable<OrderModel> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${environment.URL}/orders`, {
      params: payload,
      headers: headers
    }).pipe(
      map((response: any) => {
        return response as OrderModel;
      })
    );
  }
  
  
  getAllOrders(): Observable<Order[]> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${environment.URL}/orders/all`, {
      headers: headers
    }).pipe(
      map((response: any) => {
        // Manejar diferentes estructuras de respuesta
        if (response?.data && Array.isArray(response.data)) {
          return response.data as Order[];
        } else if (Array.isArray(response)) {
          return response as Order[];
        } else {
          return [];
        }
      })
    );
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<any>(`${environment.URL}/orders/number/${orderNumber}`).pipe(
      map((response: any) => {
        return response.data as Order;
      })
    );
  }

  // GET /api/order-statuses - Obtener todos los estados de órdenes
  getOrderStatuses(): Observable<OrderStatus[]> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${environment.URL}/order-statuses`, {
      headers: headers
    }).pipe(
      map((response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data as OrderStatus[];
        } else if (Array.isArray(response)) {
          return response as OrderStatus[];
        } else {
          return [];
        }
      })
    );
  }

  // GET /api/orders/{id}/status-history - Obtener historial de cambios de estado
  getOrderStatusHistory(orderId: number): Observable<any[]> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${environment.URL}/orders/${orderId}/status-history`, {
      headers: headers
    }).pipe(
      map((response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      })
    );
  }

  // PUT /api/orders/{id}/status - Actualizar estado de una orden
  updateOrderStatus(orderId: number, payload: { 
    order_status_id: number, 
    note?: string, 
    changed_at?: string 
  }): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.put<any>(`${environment.URL}/orders/${orderId}/status`, payload, {
      headers: headers
    });
  }

  // POST /api/orders/{id}/status - Crear nuevo cambio de estado
  createOrderStatusChange(orderId: number, payload: {
    order_status_id: number,
    note?: string,
    changed_at?: string
  }): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.post<any>(`${environment.URL}/orders/${orderId}/status`, payload, {
      headers: headers
    });
  }

  // GET /api/orders/status-counts - Obtener conteos por estado
  getOrderStatusCounts(): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${environment.URL}/orders/status-counts`, {
      headers: headers
    });
  }

  // GET /api/orders/by-status/{status} - Obtener órdenes por estado específico
  getOrdersByStatus(status: string, payload?: Params): Observable<OrderModel> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${environment.URL}/orders/by-status/${status}`, {
      params: payload,
      headers: headers
    }).pipe(
      map((response: any) => {
        return response as OrderModel;
      })
    );
  }

  // POST /api/orders/checkout - Calcular totales del checkout
  checkout(payload: any): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.post<any>(`${environment.URL}/orders/checkout`, payload, {
      headers: headers
    });
  }

  // POST /api/orders - Crear nueva orden
  placeOrder(payload: any): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.post<any>(`${environment.URL}/orders`, payload, {
      headers: headers
    });
  }

  // Método privado para obtener el token del localStorage
  private getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

}
