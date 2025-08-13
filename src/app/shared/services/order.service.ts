import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { OrderModel } from '../interface/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {



  constructor(private http: HttpClient) {}

  getOrders(payload?: Params): Observable<OrderModel> {
    return this.http.get<any>(`${environment.apiUrl}/orders`, {
      params: payload,
    }).pipe(
      map((response: any) => {
        return response as OrderModel;
      })
    );
  }

}
