import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { OrderStatusModel } from '../interface/order-status.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderStatusService {

  constructor(private http: HttpClient) {}

  getOrderStatus(payload?: Params): Observable<OrderStatusModel> {
    return this.http.get<OrderStatusModel>(`${environment.URL}/orderStatus.json`, { params: payload });
  }
  
}
