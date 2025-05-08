import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { LicenseKeyModel } from '../interface/license-key.interface';

@Injectable({
  providedIn: 'root'
})
export class LicenseKeyService {

  constructor(private http: HttpClient) {}

  getLicenseKeys(payload?: Params): Observable<LicenseKeyModel> {
    return this.http.get<LicenseKeyModel>(`${environment.URL}/license-key.json`, { params: payload });
  }

}
