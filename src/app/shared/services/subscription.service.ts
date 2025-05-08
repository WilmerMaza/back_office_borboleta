import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { SubscriptionModel } from '../interface/subscription.interface';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private http: HttpClient) {}

  getSubscribeList(payload?: Params): Observable<SubscriptionModel> {
    return this.http.get<SubscriptionModel>(`${environment.URL}/subscribe.json`, { params: payload });
  }

}
