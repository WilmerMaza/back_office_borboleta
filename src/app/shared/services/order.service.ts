import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Params } from '../interface/core.interface';
import { OrderModel, Order } from '../interface/order.interface';
import { OrderStatusModel, OrderStatus } from '../interface/order-status.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {}

  // GET /api/orders/all - Obtener todas las órdenes del sistema
  getOrders(payload?: Params): Observable<OrderModel> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const endpoint = `${environment.URL}/orders/all`;
    
    return this.http.get<any>(endpoint, {
      params: payload,
      headers: headers
    }).pipe(
      map((response: any) => {
        // Determinar si la respuesta es un array directo o tiene estructura {data: []}
        let ordersData: Order[] = [];
        let totalCount = 0;
        
        if (Array.isArray(response)) {
          ordersData = response;
          totalCount = response.length;
        } else if (response?.data && Array.isArray(response.data)) {
          ordersData = response.data;
          totalCount = response.total || response.data.length;
        }
        
        // Construir respuesta en formato OrderModel
        const result: OrderModel = {
          data: ordersData,
          total: totalCount,
          ...response
        };
        
        return result;
      })
    );
  }
  
  
  getAllOrders(): Observable<Order[]> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const endpoint = `${environment.URL}/orders/all`;
    console.log('🟣 [OrderService.getAllOrders] Endpoint usado:', endpoint);
    console.log('🟣 [OrderService.getAllOrders] Este es el endpoint que muestra TODOS los pedidos');
    
    return this.http.get<any>(endpoint, {
      headers: headers
    }).pipe(
      map((response: any) => {
        console.log('🟢 [OrderService.getAllOrders] Respuesta recibida:', response);
        console.log('🟢 [OrderService.getAllOrders] Cantidad de pedidos:', Array.isArray(response) ? response.length : (response?.data?.length || 0));
        
        // Manejar diferentes estructuras de respuesta
        if (response?.data && Array.isArray(response.data)) {
          console.log('✅ [OrderService.getAllOrders] Pedidos encontrados en response.data:', response.data.length);
          return response.data as Order[];
        } else if (Array.isArray(response)) {
          console.log('✅ [OrderService.getAllOrders] Respuesta es array directo:', response.length);
          return response as Order[];
        } else {
          console.log('⚠️ [OrderService.getAllOrders] No se encontraron pedidos');
          return [];
        }
      })
    );
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Logs detallados para depuración
    console.log('🔵 [OrderService.getOrderByNumber] ========== INICIO ==========');
    console.log('🔵 [OrderService.getOrderByNumber] Obteniendo orden número:', orderNumber);
    console.log('🔵 [OrderService.getOrderByNumber] Token disponible:', !!token);
    console.log('🔵 [OrderService.getOrderByNumber] Token (primeros 50 caracteres):', token ? token.substring(0, 50) + '...' : 'NO HAY TOKEN');
    console.log('🔵 [OrderService.getOrderByNumber] URL completa:', `${environment.URL}/orders/number/${orderNumber}`);
    console.log('🔵 [OrderService.getOrderByNumber] Headers enviados:', headers);
    
    // Verificar información del usuario del token (si es JWT)
    if (token && typeof window !== 'undefined') {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          // Es un JWT, intentar decodificar el payload
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔵 [OrderService.getOrderByNumber] Payload del token (decodificado):', payload);
          console.log('🔵 [OrderService.getOrderByNumber] User ID en token:', payload.user_id || payload.id || payload.sub);
          console.log('🔵 [OrderService.getOrderByNumber] Rol en token:', payload.role || payload.roles);
          console.log('🔵 [OrderService.getOrderByNumber] Permisos en token:', payload.permissions);
        }
      } catch (error) {
        console.log('⚠️ [OrderService.getOrderByNumber] No se pudo decodificar el token (puede no ser JWT)');
      }
    }
    
    return this.http.get<any>(`${environment.URL}/orders/number/${orderNumber}`, {
      headers: headers
    }).pipe(
      map((response: any) => {
        console.log('🟢 [OrderService.getOrderByNumber] ✅ Respuesta exitosa:', response);
        console.log('🟡 [OrderService.getOrderByNumber] order_status_id:', response?.data?.order_status_id);
        console.log('🟡 [OrderService.getOrderByNumber] order_status:', response?.data?.order_status);
        console.log('🟡 [OrderService.getOrderByNumber] order_status.id:', response?.data?.order_status?.id);
        console.log('🟡 [OrderService.getOrderByNumber] order_status.slug:', response?.data?.order_status?.slug);
        console.log('🟡 [OrderService.getOrderByNumber] order_status.name:', response?.data?.order_status?.name);
        console.log('🟡 [OrderService.getOrderByNumber] order_status.sequence:', response?.data?.order_status?.sequence);
        console.log('🟢 [OrderService.getOrderByNumber] ========== FIN ==========');
        return response.data as Order;
      }),
      catchError((error: any) => {
        console.error('🔴 [OrderService.getOrderByNumber] ❌ ERROR:', error);
        console.error('🔴 [OrderService.getOrderByNumber] Status:', error?.status);
        console.error('🔴 [OrderService.getOrderByNumber] Mensaje:', error?.error?.message || error?.message);
        console.error('🔴 [OrderService.getOrderByNumber] Error completo:', error);
        console.log('🔴 [OrderService.getOrderByNumber] ========== FIN ==========');
        return throwError(() => error);
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
