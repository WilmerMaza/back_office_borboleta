import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { OrderModel, Order } from '../interface/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  skeletonLoader = false;

  constructor(private http: HttpClient) {}

  getOrders(payload?: Params): Observable<OrderModel> {
    return this.http.get<any>(`${environment.URL}/orders`, {
      params: payload,
    }).pipe(
      map((response: any) => {
        return response as OrderModel;
      })
    );
  }

  updateOrderStatus(orderId: number, payload: { order_status_id: number, note: string, changed_at: string }): Observable<any> {
    return this.http.put<any>(`${environment.URL}/orders/${orderId}/status`, payload);
  }

}
