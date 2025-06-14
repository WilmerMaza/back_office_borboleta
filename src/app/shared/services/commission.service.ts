import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CommissionModel } from '../interface/commission.interface';
import { Params } from '../interface/core.interface';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {

  constructor(private http: HttpClient) {}

  getCommissionHistory(payload?: Params): Observable<CommissionModel> {
    return this.http.get<CommissionModel>(
      `assets/data/commissionHistory.json`,
      { params: payload }
    );
  }
}
