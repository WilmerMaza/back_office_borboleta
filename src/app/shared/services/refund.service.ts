import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { RefundModel } from '../interface/refund.interface';

@Injectable({
  providedIn: 'root'
})
export class RefundService {

  constructor(private http: HttpClient) {}

  getRefunds(payload?: Params): Observable<RefundModel> {
    return this.http.get<RefundModel>(`assets/data/refund.json`, {
      params: payload,
    });
  }

}
