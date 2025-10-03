import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
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
    
    console.log('Solicitando órdenes con payload:', payload);
    console.log('URL:', `${environment.URL}/orders`);
    console.log('Token incluido:', !!token);
    
    return this.http.get<any>(`${environment.URL}/orders`, {
      params: payload,
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Respuesta de órdenes recibida:', response);
        console.log('Tipo de response:', typeof response);
        console.log('Tipo de response.data:', typeof response?.data);
        console.log('Es array response.data:', Array.isArray(response?.data));
      }),
      map((response: any) => {
        return response as OrderModel;
      })
    );
  }

  // GET /api/orders/all - Obtener TODAS las órdenes sin paginación
  getAllOrders(): Observable<Order[]> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('Solicitando TODAS las órdenes del sistema');
    console.log('URL:', `${environment.URL}/orders/all`);
    console.log('Token incluido:', !!token);
    
    return this.http.get<any>(`${environment.URL}/orders/all`, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Todas las órdenes recibidas:', response);
        console.log('Cantidad de órdenes:', response?.data?.length || response?.length);
      }),
      map((response: any) => {
        // Manejar diferentes estructuras de respuesta
        if (response?.data && Array.isArray(response.data)) {
          return response.data as Order[];
        } else if (Array.isArray(response)) {
          return response as Order[];
        } else {
          console.warn('Estructura de respuesta inesperada:', response);
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
    
    console.log('Solicitando estados de órdenes');
    console.log('URL:', `${environment.URL}/order-statuses`);
    console.log('Token incluido:', !!token);
    
    return this.http.get<any>(`${environment.URL}/order-statuses`, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Estados de órdenes recibidos:', response);
      }),
      map((response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data as OrderStatus[];
        } else if (Array.isArray(response)) {
          return response as OrderStatus[];
        } else {
          console.warn('Estructura de respuesta inesperada para estados:', response);
          return [];
        }
      })
    );
  }

  // GET /api/orders/{id}/status-history - Obtener historial de cambios de estado
  getOrderStatusHistory(orderId: number): Observable<any[]> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('Solicitando historial de estado para orden:', orderId);
    console.log('URL:', `${environment.URL}/orders/${orderId}/status-history`);
    
    return this.http.get<any>(`${environment.URL}/orders/${orderId}/status-history`, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Historial de estado recibido:', response);
      }),
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
    
    console.log('Actualizando estado de orden:', orderId);
    console.log('Payload:', payload);
    console.log('URL:', `${environment.URL}/orders/${orderId}/status`);
    
    return this.http.put<any>(`${environment.URL}/orders/${orderId}/status`, payload, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Estado actualizado exitosamente:', response);
      })
    );
  }

  // POST /api/orders/{id}/status - Crear nuevo cambio de estado
  createOrderStatusChange(orderId: number, payload: {
    order_status_id: number,
    note?: string,
    changed_at?: string
  }): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('Creando cambio de estado para orden:', orderId);
    console.log('Payload:', payload);
    console.log('URL:', `${environment.URL}/orders/${orderId}/status`);
    
    return this.http.post<any>(`${environment.URL}/orders/${orderId}/status`, payload, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Cambio de estado creado exitosamente:', response);
      })
    );
  }

  // GET /api/orders/status-counts - Obtener conteos por estado
  getOrderStatusCounts(): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('Solicitando conteos por estado de órdenes');
    console.log('URL:', `${environment.URL}/orders/status-counts`);
    
    return this.http.get<any>(`${environment.URL}/orders/status-counts`, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Conteos por estado recibidos:', response);
      })
    );
  }

  // GET /api/orders/by-status/{status} - Obtener órdenes por estado específico
  getOrdersByStatus(status: string, payload?: Params): Observable<OrderModel> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('Solicitando órdenes por estado:', status);
    console.log('URL:', `${environment.URL}/orders/by-status/${status}`);
    console.log('Payload:', payload);
    
    return this.http.get<any>(`${environment.URL}/orders/by-status/${status}`, {
      params: payload,
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Órdenes por estado recibidas:', response);
      }),
      map((response: any) => {
        return response as OrderModel;
      })
    );
  }

  // POST /api/orders/checkout - Calcular totales del checkout
  checkout(payload: any): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('Solicitando checkout con payload:', payload);
    console.log('URL:', `${environment.URL}/orders/checkout`);
    console.log('Token incluido:', !!token);
    
    return this.http.post<any>(`${environment.URL}/orders/checkout`, payload, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Respuesta del checkout:', response);
      })
    );
  }

  // POST /api/orders - Crear nueva orden
  placeOrder(payload: any): Observable<any> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('Creando orden con payload:', payload);
    console.log('URL:', `${environment.URL}/orders`);
    console.log('Token incluido:', !!token);
    
    return this.http.post<any>(`${environment.URL}/orders`, payload, {
      headers: headers
    }).pipe(
      tap(response => {
        console.log('Orden creada exitosamente:', response);
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
